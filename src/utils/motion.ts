/**
 * Motion & Pedometer Processing Engine
 * Handles DeviceMotionEvent parsing, peak detection for steps,
 * and vertical dip-rise kinematics for squat detection.
 */

export interface MotionSample {
  time: number;
  rawMag: number;
  filteredMag: number;
}

export type SquatPhase = 'idle' | 'descending' | 'deep' | 'ascending';

export class MotionTracker {
  private isListening = false;
  private onStepCallback: ((currentSteps: number) => void) | null = null;
  private onSquatCallback: ((currentSquats: number, phase: SquatPhase) => void) | null = null;
  private onWaveformCallback: ((sample: MotionSample) => void) | null = null;

  // Step detection parameters
  private stepCount = 0;
  private lastStepTimestamp = 0;
  private emaGravity = 9.8;
  private emaDynamic = 0;
  private readonly STEP_THRESHOLD = 1.35; // m/s^2 above baseline
  private readonly MIN_STEP_INTERVAL = 320; // ms minimum between steps
  private hasCrossedStepThreshold = false;

  // Squat detection parameters
  private squatCount = 0;
  private squatPhase: SquatPhase = 'idle';
  private phaseStartTime = 0;
  private minDipObserved = 9.8;
  private maxThrustObserved = 9.8;

  public async requestPermissions(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    // Check for iOS 13+ permission model
    const DeviceMotionEventTyped = window.DeviceMotionEvent as any;
    if (
      typeof DeviceMotionEventTyped !== 'undefined' &&
      typeof DeviceMotionEventTyped.requestPermission === 'function'
    ) {
      try {
        const response = await DeviceMotionEventTyped.requestPermission();
        return response === 'granted';
      } catch (err) {
        console.warn('Error requesting DeviceMotion permission:', err);
        return false;
      }
    }

    // Standard Android / desktop browser
    return 'ondevicemotion' in window;
  }

  public start(callbacks: {
    onStep?: (steps: number) => void;
    onSquat?: (squats: number, phase: SquatPhase) => void;
    onWaveform?: (sample: MotionSample) => void;
  }) {
    if (this.isListening) return;
    this.onStepCallback = callbacks.onStep || null;
    this.onSquatCallback = callbacks.onSquat || null;
    this.onWaveformCallback = callbacks.onWaveform || null;

    if (typeof window !== 'undefined') {
      window.addEventListener('devicemotion', this.handleMotion, { passive: true });
      this.isListening = true;
    }
  }

  public stop() {
    if (!this.isListening) return;
    if (typeof window !== 'undefined') {
      window.removeEventListener('devicemotion', this.handleMotion);
    }
    this.isListening = false;
  }

  public resetCounts() {
    this.stepCount = 0;
    this.squatCount = 0;
    this.squatPhase = 'idle';
    this.hasCrossedStepThreshold = false;
  }

  public simulateStep() {
    this.stepCount += 1;
    if (this.onStepCallback) {
      this.onStepCallback(this.stepCount);
    }
    if (this.onWaveformCallback) {
      this.onWaveformCallback({
        time: Date.now(),
        rawMag: 14.5,
        filteredMag: 13.8,
      });
    }
  }

  public simulateSquat() {
    this.squatCount += 1;
    if (this.onSquatCallback) {
      this.onSquatCallback(this.squatCount, 'ascending');
      setTimeout(() => {
        if (this.onSquatCallback) this.onSquatCallback(this.squatCount, 'idle');
      }, 300);
    }
  }

  private handleMotion = (event: DeviceMotionEvent) => {
    const acc = event.accelerationIncludingGravity || event.acceleration;
    if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

    const x = acc.x || 0;
    const y = acc.y || 0;
    const z = acc.z || 0;
    const rawMag = Math.sqrt(x * x + y * y + z * z);
    const now = Date.now();

    // Low pass filter to track steady gravity vector
    this.emaGravity = 0.9 * this.emaGravity + 0.1 * rawMag;
    // High pass / dynamic delta
    const deltaMag = Math.abs(rawMag - this.emaGravity);
    this.emaDynamic = 0.7 * this.emaDynamic + 0.3 * deltaMag;

    // Send sample to visualizer
    if (this.onWaveformCallback) {
      this.onWaveformCallback({
        time: now,
        rawMag,
        filteredMag: this.emaDynamic,
      });
    }

    // 1. Step detection algorithm
    if (deltaMag > this.STEP_THRESHOLD) {
      this.hasCrossedStepThreshold = true;
    } else if (this.hasCrossedStepThreshold && deltaMag < this.STEP_THRESHOLD * 0.5) {
      // Valley after peak
      if (now - this.lastStepTimestamp > this.MIN_STEP_INTERVAL) {
        this.stepCount += 1;
        this.lastStepTimestamp = now;
        if (this.onStepCallback) {
          this.onStepCallback(this.stepCount);
        }
      }
      this.hasCrossedStepThreshold = false;
    }

    // 2. Squat kinematic detection algorithm
    // In a squat, phone dips down (acceleration lowers < 8.5), rebounds at bottom (> 11.5), then settles
    if (this.squatPhase === 'idle') {
      if (rawMag < 8.2) {
        this.squatPhase = 'descending';
        this.phaseStartTime = now;
        this.minDipObserved = rawMag;
        this.onSquatCallback?.(this.squatCount, 'descending');
      }
    } else if (this.squatPhase === 'descending') {
      if (rawMag < this.minDipObserved) this.minDipObserved = rawMag;
      if (rawMag > 11.2 && now - this.phaseStartTime > 300) {
        this.squatPhase = 'deep';
        this.maxThrustObserved = rawMag;
        this.onSquatCallback?.(this.squatCount, 'deep');
      }
      // Timeout if stuck descending > 2.5s
      if (now - this.phaseStartTime > 2500) {
        this.squatPhase = 'idle';
        this.onSquatCallback?.(this.squatCount, 'idle');
      }
    } else if (this.squatPhase === 'deep') {
      if (rawMag > this.maxThrustObserved) this.maxThrustObserved = rawMag;
      // When user finishes ascending and returns to resting gravity (~9.8)
      if (Math.abs(rawMag - 9.8) < 1.0 && now - this.phaseStartTime > 700) {
        this.squatCount += 1;
        this.squatPhase = 'ascending';
        this.onSquatCallback?.(this.squatCount, 'ascending');
        setTimeout(() => {
          this.squatPhase = 'idle';
          this.onSquatCallback?.(this.squatCount, 'idle');
        }, 350);
      }
      if (now - this.phaseStartTime > 4000) {
        this.squatPhase = 'idle';
        this.onSquatCallback?.(this.squatCount, 'idle');
      }
    }
  };
}

export const motionTracker = new MotionTracker();

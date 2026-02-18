import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export type FeatureFlag = keyof typeof environment.features;

@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
    isEnabled(flag: FeatureFlag): boolean {
        return environment.features[flag] ?? false;
    }
}

import { requireOptionalNativeModule } from "expo";
import type { MediaRef } from "./expedition";
export const media = requireOptionalNativeModule<{
  pick(): Promise<MediaRef[]>;
  available(uri: string): Promise<boolean>;
  open(uri: string, type: string): Promise<void>;
}>("TrailMedia");

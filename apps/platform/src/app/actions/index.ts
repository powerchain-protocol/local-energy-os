import actions from "@powerchain/actions/manifest";
import type { PlatformAction } from "@/types/actions";

export const platformActions = actions as PlatformAction[];
export const findAction = (id: string) => platformActions.find((action) => action.id === id);

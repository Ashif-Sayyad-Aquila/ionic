// src/types/fabric-fix.d.ts
// Lightweight patch to work around Fabric 6.x broken event generics.
// This file widens the Canvas.on handler signatures used across the app.

import 'fabric';

declare module 'fabric' {
  // Generic alias you can use in your code if desired
  export type FabricEvt = import('fabric').TPointerEventInfo<import('fabric').FabricObject>;

  // Replace restrictive Canvas.on signature with a permissive one.
  // Keep it permissive (any) to avoid the broken TPointerEvent constraint.
  interface Canvas {
    /**
     * Allow any handler shape for events. Handlers will receive the real
     * Fabric event object at runtime — cast it to FabricEvt in your handler
     * if you want stronger typing.
     */
    on(eventName: string, handler: (e: any) => void): this;

    // Optional: provide a typed overload for common object events (still permissive)
    on(
      eventName:
        | 'object:moving'
        | 'object:scaling'
        | 'object:rotating'
        | 'object:modified'
        | 'object:added'
        | 'object:removed'
        | 'selection:created'
        | 'selection:updated'
        | 'mouse:down'
        | 'mouse:up',
      handler: (e: FabricEvt) => void
    ): this;
  }
}

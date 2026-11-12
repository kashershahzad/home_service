/**
 * Xcode 26 / Swift 6.2: expo-modules-jsi still uses `nonisolated(unsafe) let`
 * locals that get sent into `JavaScriptActor.assumeIsolated`, which fails with
 * "sending 'slot' risks causing data races". Wrap those captures in
 * UncheckedSendable (and NonisolatedUnsafeVar when mutated), matching Expo's
 * earlier #51040 fix pattern.
 *
 * Safe to re-run; no-ops when already patched or when upstream ships the fix.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'node_modules', 'expo-modules-jsi');

const patches = [
  {
    file: path.join(
      root,
      'apple/Sources/ExpoModulesJSI/Runtime/Values/JavaScriptObject.swift'
    ),
    from: `  try withUnsafeTemporaryAllocation(of: facebook.jsi.Value.self, capacity: 1) { buffer in
    // The isolated closure below runs synchronously on this thread.
    nonisolated(unsafe) let slot = buffer.baseAddress!
    expo.emplaceUndefined(slot)
    defer {
      expo.destroyValues(slot, 1)
    }
    // The runtime can't be deallocated during a call on its JavaScript thread, so it's borrowed without
    // a retain.
    try runtime._withUnsafeGuaranteedRef { runtime in
      try JavaScriptActor.assumeIsolated {
        try encode(JavaScriptValue.Slot(slot), runtime)
      }
    }
    body(slot.pointee)
  }`,
    to: `  try withUnsafeTemporaryAllocation(of: facebook.jsi.Value.self, capacity: 1) { buffer in
    // The isolated closure below runs synchronously on this thread.
    // UncheckedSendable: Swift 6.2 still reports "sending '...' risks causing data races" for a
    // \`nonisolated(unsafe) let\` captured into \`JavaScriptActor.assumeIsolated\` through another closure.
    let slot = UncheckedSendable(buffer.baseAddress!)
    expo.emplaceUndefined(slot.value)
    defer {
      expo.destroyValues(slot.value, 1)
    }
    // The runtime can't be deallocated during a call on its JavaScript thread, so it's borrowed without
    // a retain.
    try runtime._withUnsafeGuaranteedRef { runtime in
      try JavaScriptActor.assumeIsolated {
        try encode(JavaScriptValue.Slot(slot.value), runtime)
      }
    }
    body(slot.value.pointee)
  }`,
  },
  {
    file: path.join(
      root,
      'apple/Sources/ExpoModulesJSI/Runtime/Values/JavaScriptFunction.swift'
    ),
    from: `    try withUnsafeTemporaryAllocation(of: facebook.jsi.Value.self, capacity: argumentCount + 1) { storage in
      // The isolated closures below run synchronously on this thread.
      nonisolated(unsafe) let arguments = storage.baseAddress!
      nonisolated(unsafe) let result = arguments + argumentCount
      for index in 0...argumentCount {
        expo.emplaceUndefined(arguments + index)
      }
      defer {
        expo.destroyValues(arguments, argumentCount + 1)
      }
      try JavaScriptActor.assumeIsolated {
        try emplacing(JavaScriptValuesBuffer(runtime, start: arguments, count: argumentCount), runtime)
      }
      try throwCppErrorUnlessSucceeded(
        expo.callFunctionInto(runtime.pointee, pointee, arguments, argumentCount, result)
      )
      try JavaScriptActor.assumeIsolated {
        try withResult(JavaScriptUnownedValue(runtime.pointee, result), runtime)
      }
    }`,
    to: `    try withUnsafeTemporaryAllocation(of: facebook.jsi.Value.self, capacity: argumentCount + 1) { storage in
      // The isolated closures below run synchronously on this thread.
      // UncheckedSendable: Swift 6.2 still reports "sending '...' risks causing data races" for a
      // \`nonisolated(unsafe) let\` captured into \`JavaScriptActor.assumeIsolated\`.
      let arguments = UncheckedSendable(storage.baseAddress!)
      let result = UncheckedSendable(arguments.value + argumentCount)
      for index in 0...argumentCount {
        expo.emplaceUndefined(arguments.value + index)
      }
      defer {
        expo.destroyValues(arguments.value, argumentCount + 1)
      }
      try JavaScriptActor.assumeIsolated {
        try emplacing(JavaScriptValuesBuffer(runtime, start: arguments.value, count: argumentCount), runtime)
      }
      try throwCppErrorUnlessSucceeded(
        expo.callFunctionInto(runtime.pointee, pointee, arguments.value, argumentCount, result.value)
      )
      try JavaScriptActor.assumeIsolated {
        try withResult(JavaScriptUnownedValue(runtime.pointee, result.value), runtime)
      }
    }`,
  },
  {
    file: path.join(
      root,
      'apple/Sources/ExpoModulesJSI/Coding/JavaScriptCodable+Containers.swift'
    ),
    apply(src) {
      let next = src;
      // Drop @inlinable, keep @usableFromInline so public @inlinable decode can call it while
      // the body stays in-module and can use internal UncheckedSendable / NonisolatedUnsafeVar.
      next = next.replace(
        `  /// Decodes every element of \`array\`, with one closure call per element.
  @inlinable
  internal static func decodeElements(of array: borrowing JavaScriptArray, in runtime: borrowing JavaScriptRuntime)`,
        `  /// Decodes every element of \`array\`, with one closure call per element.
  // \`@usableFromInline\` (not \`@inlinable\`): callable from \`@inlinable\` public \`decode\`, while the
  // body stays in-module so it can use internal UncheckedSendable / NonisolatedUnsafeVar (Xcode 26).
  @usableFromInline
  internal static func decodeElements(of array: borrowing JavaScriptArray, in runtime: borrowing JavaScriptRuntime)`
      );
      // Upgrade an earlier patch that only removed @inlinable.
      next = next.replace(
        `  /// Decodes every element of \`array\`, with one closure call per element.
  // Not \`@inlinable\`: Xcode 26 needs UncheckedSendable / NonisolatedUnsafeVar here, and those are internal.
  internal static func decodeElements(of array: borrowing JavaScriptArray, in runtime: borrowing JavaScriptRuntime)`,
        `  /// Decodes every element of \`array\`, with one closure call per element.
  // \`@usableFromInline\` (not \`@inlinable\`): callable from \`@inlinable\` public \`decode\`, while the
  // body stays in-module so it can use internal UncheckedSendable / NonisolatedUnsafeVar (Xcode 26).
  @usableFromInline
  internal static func decodeElements(of array: borrowing JavaScriptArray, in runtime: borrowing JavaScriptRuntime)`
      );
      const from = `    return try [Element](unsafeUninitializedCapacity: count) { buffer, initializedCount in
      nonisolated(unsafe) let base = buffer.baseAddress
      nonisolated(unsafe) var initialized = 0
      // Also when \`Element.decode\` throws, so the elements decoded so far are deinitialized.
      defer {
        initializedCount = initialized
      }
      try JavaScriptActor.assumeIsolated {
        try array.forEachUnowned(count: count) { element in
          (base.unsafelyUnwrapped + initialized).initialize(to: try Element.decode(element, in: runtime))
          initialized += 1
        }
      }
    }`;
      const to = `    return try [Element](unsafeUninitializedCapacity: count) { buffer, initializedCount in
      // UncheckedSendable / NonisolatedUnsafeVar: Swift 6.2 still reports
      // "sending '...' risks causing data races" for \`nonisolated(unsafe)\` locals
      // captured into \`JavaScriptActor.assumeIsolated\`.
      let base = UncheckedSendable(buffer.baseAddress)
      let initialized = NonisolatedUnsafeVar(0)
      // Also when \`Element.decode\` throws, so the elements decoded so far are deinitialized.
      defer {
        initializedCount = initialized.value
      }
      try JavaScriptActor.assumeIsolated {
        try array.forEachUnowned(count: count) { element in
          (base.value.unsafelyUnwrapped + initialized.value).initialize(to: try Element.decode(element, in: runtime))
          initialized.value += 1
        }
      }
    }`;
      if (next.includes(from)) next = next.replace(from, to);
      return next === src ? null : next;
    },
  },
];

if (!fs.existsSync(root)) {
  process.exit(0);
}

let changed = 0;
for (const patch of patches) {
  const { file } = patch;
  if (!fs.existsSync(file)) continue;
  const src = fs.readFileSync(file, 'utf8');
  let next = null;

  if (typeof patch.apply === 'function') {
    next = patch.apply(src);
  } else if (src.includes(patch.from) && !src.includes(patch.to)) {
    next = src.replace(patch.from, patch.to);
  }

  if (!next || next === src) continue;
  fs.writeFileSync(file, next);
  changed += 1;
  console.log(`[fix-expo-modules-jsi-xcode26] patched ${path.relative(process.cwd(), file)}`);
}

if (changed === 0) {
  console.log('[fix-expo-modules-jsi-xcode26] nothing to patch');
}

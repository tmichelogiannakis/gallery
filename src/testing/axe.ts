import { ComponentFixture } from '@angular/core/testing';
import axe, { Result, RunOptions } from 'axe-core';

const DEFAULT_RULES: RunOptions['rules'] = {
  // Only judgeable against a whole document; a component fixture renders a fragment
  region: { enabled: false },
  // jsdom has no layout engine and no canvas, so axe cannot measure contrast here
  'color-contrast': { enabled: false }
};

type AxeTarget = ComponentFixture<unknown> | HTMLElement;

const resolveTarget = async (target: AxeTarget): Promise<HTMLElement> => {
  if (target instanceof HTMLElement) {
    return target;
  }

  await target.whenStable();

  return target.nativeElement as HTMLElement;
};

const describeViolation = (violation: Result) => {
  const nodes = violation.nodes
    .map((node) => `  ${node.html}\n${node.failureSummary ?? ''}`)
    .join('\n');

  return `${violation.id} (${violation.impact}): ${violation.help}\n${violation.helpUrl}\n${nodes}`;
};

/**
 * Runs axe against a fixture (or a bare element) and resolves with the violations it found.
 *
 * Note that jsdom has no layout engine, so rules that need rendered geometry — colour contrast
 * above all — cannot be evaluated here and are turned off. Those still need a human eye or a
 * browser-based run.
 */
export const runAxe = async (target: AxeTarget, options: RunOptions = {}): Promise<Result[]> => {
  const element = await resolveTarget(target);

  const results = await axe.run(element, {
    ...options,
    resultTypes: ['violations'],
    rules: { ...DEFAULT_RULES, ...options.rules }
  });

  return results.violations;
};

/** Fails the test with the offending markup and a link to the rule when axe reports a violation. */
export const expectNoAxeViolations = async (target: AxeTarget, options?: RunOptions) => {
  const violations = await runAxe(target, options);

  // Compared as one string so the rule ids lead the assertion message rather than an array diff
  const report = violations.length
    ? [
        `${violations.length} accessibility violation(s): ${violations.map(({ id }) => id).join(', ')}`,
        ...violations.map(describeViolation)
      ].join('\n\n')
    : '';

  expect(report).toBe('');
};

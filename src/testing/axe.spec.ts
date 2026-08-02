import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { expectNoAxeViolations, runAxe } from './axe';

/**
 * Guards the guard: an axe integration that reports nothing no matter what is worse than none,
 * so these exercise markup with a known violation and markup without one.
 */
describe('axe test helper', () => {
  const createFixture = async (template: string): Promise<ComponentFixture<unknown>> => {
    @Component({ template: '' })
    class TestHost {}

    TestBed.overrideTemplate(TestHost, template);

    const fixture = TestBed.createComponent(TestHost);
    await fixture.whenStable();

    return fixture;
  };

  it('reports the rule that markup breaks', async () => {
    const fixture = await createFixture('<img src="photo.jpg" />');

    const violations = await runAxe(fixture);

    expect(violations.map((violation) => violation.id)).toContain('image-alt');
  });

  it('fails the assertion, naming the rule and the offending markup', async () => {
    const fixture = await createFixture('<button type="button"></button>');

    const failure = await expectNoAxeViolations(fixture).then(
      () => null,
      (reason: unknown) => reason as { actual?: unknown }
    );

    expect(failure).not.toBeNull();
    expect(String(failure?.actual)).toContain('button-name');
    expect(String(failure?.actual)).toContain('<button type="button">');
  });

  it('passes for markup that breaks no rules', async () => {
    const fixture = await createFixture('<img src="photo.jpg" alt="A photo" />');

    await expectNoAxeViolations(fixture);
  });
});

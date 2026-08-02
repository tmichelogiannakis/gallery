import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ConfirmDialog, ConfirmDialogData } from './confirm-dialog';

describe('ConfirmDialog', () => {
  let fixture: ComponentFixture<ConfirmDialog>;
  let dialogRef: { close: ReturnType<typeof vi.fn> };

  const data: ConfirmDialogData = {
    title: 'Remove from favorites?',
    message: 'This photo will no longer appear in your favorites.',
    confirmLabel: 'Remove',
    cancelLabel: 'Keep'
  };

  const text = (selector: string) =>
    fixture.nativeElement.querySelector(selector)?.textContent?.trim();

  const click = (selector: string) => {
    (fixture.nativeElement.querySelector(selector) as HTMLButtonElement).click();
    fixture.detectChanges();
  };

  const createComponent = async (dialogData: ConfirmDialogData) => {
    dialogRef = { close: vi.fn() };

    TestBed.configureTestingModule({
      imports: [ConfirmDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: MatDialogRef, useValue: dialogRef }
      ]
    });

    fixture = TestBed.createComponent(ConfirmDialog);
    await fixture.whenStable();
  };

  it('renders the question and the labels it was given', async () => {
    await createComponent(data);

    expect(text('[mat-dialog-title]')).toBe('Remove from favorites?');
    expect(text('.confirm-message')).toBe('This photo will no longer appear in your favorites.');
    expect(text('.confirm-button')).toBe('Remove');
    expect(text('.cancel-button')).toBe('Keep');
  });

  it('falls back to a generic cancel label', async () => {
    await createComponent({
      title: data.title,
      message: data.message,
      confirmLabel: data.confirmLabel
    });

    expect(text('.cancel-button')).toBe('Cancel');
  });

  it('confirms when the confirm button is pressed', async () => {
    await createComponent(data);

    click('.confirm-button');

    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('declines when the cancel button is pressed', async () => {
    await createComponent(data);

    click('.cancel-button');

    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });
});

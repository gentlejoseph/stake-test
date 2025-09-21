import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styles: [
    `
      /* Hide number input spinners for Webkit browsers (Chrome, Safari) */
      input[type='number']::-webkit-inner-spin-button,
      input[type='number']::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      /* Hide number input spinners for Firefox */
      input[type='number'] {
        -moz-appearance: textfield;
      }
    `,
  ],
  template: `
    <div class="w-full px-4">
      <div
        class="bg-white box-border content-stretch flex gap-3 h-[48px] items-center px-4 relative rounded-[4px] w-full border-[1.5px] border-[#e9e9e9] transition-all duration-200"
        [class.ring-1]="focused"
        [class.ring-primary-500]="focused && (!touched || valid)"
        [class.border-primary-500]="focused && (!touched || valid)"
        [class.ring-red-500]="focused && touched && !valid"
        [class.border-red-500]="touched && !valid"
      >
        <div class="basis-0 content-stretch flex flex-col gap-0.5 grow items-start justify-center">
          <span
            class="text-xs font-medium leading-[1.3] text-[#7e7e7e] whitespace-pre transition-colors duration-200"
            [class.text-primary-500]="focused && (!touched || valid)"
            [class.text-red-500]="touched && !valid"
            >{{ label }}</span
          >
          <input
            [type]="type"
            [id]="id"
            [required]="required"
            [disabled]="disabled"
            [value]="value"
            (input)="onInput($event)"
            (focus)="onFocus()"
            (blur)="onBlur()"
            [min]="min"
            [step]="step"
            class="w-full bg-transparent text-[13px] leading-[1.3] text-[#141414] outline-none whitespace-pre transition-colors duration-200"
            [class.text-gray-400]="disabled"
            [class.placeholder-gray-400]="!touched || valid"
            [class.placeholder-red-500]="touched && !valid"
            [placeholder]="placeholder"
          />
        </div>
        <span *ngIf="touched && !valid" class="text-red-500 text-sm font-medium">!</span>
      </div>
      <span *ngIf="touched && !valid" class="text-red-500 text-xs mt-1 block">{{ error }}</span>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  @Input() type = 'text';
  @Input() id = '';
  @Input() placeholder = '';
  @Input() required = false;
  @Input() error = 'This field is required';
  @Input() label = '';
  @Input() disabled = false;
  @Input() min?: number;
  @Input() step?: number;

  value = '';

  touched = false;
  valid = true;
  focused = false;

  onChange = (value: string) => {};
  onTouch = () => {};

  onFocus(): void {
    this.focused = true;
  }

  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
    this.validate();
  }

  onBlur(): void {
    this.focused = false;
    this.touched = true;
    this.onTouch();
    this.validate();
  }

  private validate(): void {
    this.valid = !this.required || this.value.length > 0;
  }
}

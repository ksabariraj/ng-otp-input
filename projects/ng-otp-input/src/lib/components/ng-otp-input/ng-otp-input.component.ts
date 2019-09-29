import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  AfterViewInit
} from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { KeysPipe } from '../../pipes/keys.pipe';
import { Config } from '../../models/config';
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'ng-otp-input',
  templateUrl: './ng-otp-input.component.html',
  styleUrls: ['./ng-otp-input.component.scss']
})
export class NgOtpInputComponent implements OnInit, AfterViewInit {
  @Input() config: Config = { length: 4 };
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onInputChange = new EventEmitter<string>();
  otpForm: FormGroup;
  inputControls: FormControl[] = new Array(this.config.length);
  componentKey =
    Math.random()
      .toString(36)
      .substring(2) + new Date().getTime().toString(36);
  constructor(private keysPipe: KeysPipe) {}

  ngOnInit() {
    this.otpForm = new FormGroup({});
    for (let index = 0; index < this.config.length; index++) {
      this.otpForm.addControl(this.getControlName(index), new FormControl());
    }
  }
  ngAfterViewInit(): void {
    // if (!this.config.disableAutoFocus) {
    const containerItem = document.getElementById(`c_${this.componentKey}`);
    if (containerItem) {
      const ele: any = containerItem.getElementsByClassName('otp-input')[0];
      if (ele && ele.focus) {
        ele.focus();
      }
    }
    // }
  }
  private getControlName(idx) {
    return `ctrl_${idx}`;
  }

  ifLeftArrow(event) {
    return this.ifKeyCode(event, 37);
  }

  ifRightArrow(event) {
    return this.ifKeyCode(event, 39);
  }

  ifBackspaceOrDelete(event) {
    return (
      event.key === 'Backspace' ||
      event.key === 'Delete' ||
      this.ifKeyCode(event, 8) ||
      this.ifKeyCode(event, 46)
    );
  }

  ifKeyCode(event, targetCode) {
    const key = event.keyCode || event.charCode;
    // tslint:disable-next-line: triple-equals
    return key == targetCode ? true : false;
  }

  onKeyUp($event, inputIdx) {
    if ($event.target.value.length > 1) {
      $event.target.value = $event.target.value[0];
    }
    const nextInputId = this.appendKey(`otp_${inputIdx + 1}`);
    const prevInputId = this.appendKey(`otp_${inputIdx - 1}`);
    if (this.ifRightArrow($event)) {
      this.setSelected(nextInputId);
      return;
    }
    if (this.ifLeftArrow($event)) {
      this.setSelected(prevInputId);
      return;
    }
    if (!$event.target.value) {
      return;
    }
    if ($event.target.value.length > 1) {
      $event.target.value = $event.target.value[0];
    }
    if (this.ifValidEntry($event) || $event.target.value.length === 1) {
      this.focusTo(nextInputId);
    }
    this.rebuildValue();
  }

  onKeyDown($event, inputIdx) {
    const nextInputId = this.appendKey(`otp_${inputIdx + 1}`);
    const prevInputId = this.appendKey(`otp_${inputIdx - 1}`);
    const isBackspace = this.ifBackspaceOrDelete($event);
    if (isBackspace) {
      if (!$event.target.value) {
        this.setSelected(prevInputId);
      } else {
        $event.target.value = null;
      }
      this.rebuildValue();
      return false;
    }
    return true;
  }

  appendKey(id) {
    return `${id}_${this.componentKey}`;
  }

  setSelected(eleId) {
    this.focusTo(eleId);
    // const ele: any = document.getElementById(eleId);
    // if (ele && ele.setSelectionRange) {
    //   setTimeout(() => {
    //     ele.setSelectionRange(0, 1);
    //   }, 0);
    // }
  }

  ifValidEntry(event) {
    const inp = String.fromCharCode(event.keyCode);
    return (/[a-zA-Z0-9-_]/.test(inp));
  }

  focusTo(eleId) {
    const ele: any = document.getElementById(eleId);
    if (ele) {
      ele.value = '';
      ele.focus();
      // setTimeout(() => {
      //   ele.selectionStart = ele.selectionEnd = 100;
      // }, 0);
    }
  }

  rebuildValue() {
    let val = '';
    this.keysPipe.transform(this.otpForm.controls).forEach(k => {
      if (this.otpForm.controls[k].value) {
        console.log(this.otpForm.controls[k].value);
        val += this.otpForm.controls[k].value;
      }
    });
    this.onInputChange.emit(val);
  }
}

import { Component, ComponentInterface, Element, Event, EventEmitter, Host, Method, Prop, Watch, h } from '@stencil/core';

import { AccordionGroupChangeEventDetail } from '../../interface';

/**
 * @virtualProp {"ios" | "md"} mode - The mode determines which platform styles to use.
 */
@Component({
  tag: 'ion-accordion-group',
  styleUrl: 'accordion-group.scss',
  shadow: true
})
export class AccordionGroup implements ComponentInterface {
  @Element() el!: HTMLIonAccordionGroupElement;

  /**
   * If `true`, the accordion group can have multiple
   * accordion components expanded at the same time.
   */
  @Prop() multiple?: boolean;

  /**
   * The value of the accordion group.
   */
  @Prop({ mutable: true }) value?: string | string[] | null;

  /**
   * If `true`, the accordion group cannot be interacted with.
   */
  @Prop() disabled = false;

  /**
   * If `true`, the accordion group cannot be interacted with,
   * but does not alter the opacity.
   */
  @Prop() readonly = false;

  /**
   * Describes the expansion behavior for each accordion.
   * Possible values are `"float"`, `"inset"`, `"accordion"`,
   * and `"popout"`. Defaults to `"float"`.
   */
  @Prop() expand: 'float' | 'inset' | 'accordion' | 'popout' = 'float';

  /**
   * Emitted when the value property has changed.
   */
  @Event() ionChange!: EventEmitter<AccordionGroupChangeEventDetail>;

  @Watch('value')
  valueChanged() {
    this.ionChange.emit({ value: this.value });
  }

  @Watch('disabled')
  disabledChanged() {
    const { disabled } = this;
    const accordions = this.getAccordions();
    for (const accordion of accordions) {
      accordion.disabled = disabled;
    }
  }

  @Watch('readonly')
  readonlyChanged() {
    const { readonly } = this;
    const accordions = this.getAccordions();
    for (const accordion of accordions) {
      accordion.readonly = readonly;
    }
  }

  async componentDidLoad() {
    if (this.disabled) {
      this.disabledChanged();
    }
    if (this.readonly) {
      this.readonlyChanged();
    }
  }

  /**
   * @internal
   */
  @Method()
  async requestAccordionToggle(accordionValue: string | undefined, accordionExpand: boolean) {
    const { multiple, value, readonly, disabled } = this;
    if (readonly || disabled) { return; }

    if (accordionExpand) {
      /**
       * If group accepts multiple values
       * check to see if value is already in
       * in values array. If not, add it
       * to the array.
       */
      if (multiple) {
        const groupValue = (value || []) as string[];
        const valueExists = groupValue.find(v => v === accordionValue);
        if (valueExists === undefined && accordionValue !== undefined) {
          this.value = [...groupValue, accordionValue];
        }
      /**
       * If group does not accept multiple
       * values, just set the value.
       */
      } else {
        this.value = accordionValue;
      }
    } else {
      /**
       * If collapsing accordion, either filter the value
       * out of the values array or unset the value.
       */
      if (multiple) {
        const groupValue = (value || []) as string[];
        this.value = groupValue.filter(v => v !== accordionValue);
      } else {
        this.value = undefined;
      }
    }
  }

  private getAccordions() {
    return Array.from(this.el.querySelectorAll('ion-accordion'));
  }

  render() {
    const { disabled, readonly } = this;
    return (
      <Host
        class={{
          'accordion-group-disabled': disabled,
          'accordion-group-readonly': readonly,
        }}
        role="presentation"
      >
        <slot></slot>
      </Host>
    );
  }
}
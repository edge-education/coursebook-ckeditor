/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module table/tablecellproperties/ui/tablecellpropertiesview
 */
import {
    addListToDropdown,
    ButtonView,
    createLabeledDropdown,
    createLabeledInputText,
    FocusCycler,
    FormHeaderView,
    LabeledFieldView,
    LabelView,
    Model,
    submitHandler,
    ToolbarView,
    View,
    ViewCollection,
} from 'ckeditor5/src/ui';
import { Collection, FocusTracker, KeystrokeHandler } from 'ckeditor5/src/utils';
import { icons } from 'ckeditor5/src/core';
import {
    fillToolbar,
    getBorderStyleDefinitions,
    getBorderStyleLabels,
    getLabeledColorInputCreator,
} from '../../utils/ui/table-properties';
import FormRowView from '../../ui/formrowview';
import '../../../theme/form.css';
import '../../../theme/tableform.css';
import '../../../theme/tablecellproperties.css';
import fullIcon from './icons/layout-border-frame.svg';
import topIcon from './icons/layout-border-top.svg';
import rightIcon from './icons/layout-border-right.svg';
import bottomIcon from './icons/layout-border-bottom.svg';
import leftIcon from './icons/layout-border-left.svg';

const ALIGNMENT_ICONS = {
    left: icons.alignLeft,
    center: icons.alignCenter,
    right: icons.alignRight,
    justify: icons.alignJustify,
    top: icons.alignTop,
    middle: icons.alignMiddle,
    bottom: icons.alignBottom,
};

const DIRECTION_ICONS = {
    full: fullIcon,
    top: topIcon,
    right: rightIcon,
    bottom: bottomIcon,
    left: leftIcon,
};

/**
 * The class representing a table cell properties form, allowing users to customize
 * certain style aspects of a table cell, for instance, border, padding, text alignment, etc..
 */
export default class TableCellPropertiesView extends View {
    /**
     * @param locale The {@link module:core/editor/editor~Editor#locale} instance.
     * @param options Additional configuration of the view.
     * @param options.borderColors A configuration of the border color palette used by the
     * {@link module:table/tablecellproperties/ui/tablecellpropertiesview~TableCellPropertiesView#borderColorInput}.
     * @param options.backgroundColors A configuration of the background color palette used by the
     * {@link module:table/tablecellproperties/ui/tablecellpropertiesview~TableCellPropertiesView#backgroundInput}.
     * @param options.defaultTableCellProperties The default table cell properties.
     */
    constructor(locale, options) {
        super(locale);
        this.set({
            borderStyle: '',
            borderWidth: '',
            borderColor: '',
            borderDirection: 'full',
            borderTopStyle: 'none',
            borderTopWidth: '',
            borderTopColor: '',
            borderRightStyle: 'none',
            borderRightWidth: '',
            borderRightColor: '',
            borderBottomStyle: 'none',
            borderBottomWidth: '',
            borderBottomColor: '',
            borderLeftStyle: 'none',
            borderLeftWidth: '',
            borderLeftColor: '',
            padding: '',
            backgroundColor: '',
            width: '',
            height: '',
            horizontalAlignment: '',
            verticalAlignment: '',
            preset: '',
        });
        this.options = options;
        const { borderStyleDropdown, borderWidthInput, borderColorInput, borderRowLabel, borderDirectionToolbar } =
            this._createBorderFields();
        const { backgroundRowLabel, backgroundInput } = this._createBackgroundFields();
        const { widthInput, operatorLabel, heightInput, dimensionsLabel } = this._createDimensionFields();
        const { horizontalAlignmentToolbar, verticalAlignmentToolbar, alignmentLabel } = this._createAlignmentFields();
        this.focusTracker = new FocusTracker();
        this.keystrokes = new KeystrokeHandler();
        this.children = this.createCollection();
        this.borderStyleDropdown = borderStyleDropdown;
        this.borderDirectionToolbar = borderDirectionToolbar;
        this.borderWidthInput = borderWidthInput;
        this.borderColorInput = borderColorInput;
        this.backgroundInput = backgroundInput;
        this.paddingInput = this._createPaddingField();
        this.presetField = this.createPresetField();
        this.widthInput = widthInput;
        this.heightInput = heightInput;
        this.horizontalAlignmentToolbar = horizontalAlignmentToolbar;
        this.verticalAlignmentToolbar = verticalAlignmentToolbar;
        // Defer creating to make sure other fields are present and the Save button can
        // bind its #isEnabled to their error messages so there's no way to save unless all
        // fields are valid.
        const { saveButtonView, cancelButtonView } = this._createActionButtons();
        this.saveButtonView = saveButtonView;
        this.cancelButtonView = cancelButtonView;
        this._focusables = new ViewCollection();
        this._focusCycler = new FocusCycler({
            focusables: this._focusables,
            focusTracker: this.focusTracker,
            keystrokeHandler: this.keystrokes,
            actions: {
                // Navigate form fields backwards using the Shift + Tab keystroke.
                focusPrevious: 'shift + tab',
                // Navigate form fields forwards using the Tab key.
                focusNext: 'tab',
            },
        });
        // Form header.
        this.children.add(
            new FormHeaderView(locale, {
                label: this.t('Cell properties'),
            })
        );
        // Border row.
        this.children.add(
            new FormRowView(locale, {
                labelView: borderRowLabel,
                children: [
                    borderRowLabel,
                    borderStyleDropdown,
                    borderColorInput,
                    borderWidthInput,
                    borderDirectionToolbar,
                ],
                class: 'ck-table-form__border-row',
            })
        );
        // Background.
        this.children.add(
            new FormRowView(locale, {
                labelView: backgroundRowLabel,
                children: [backgroundRowLabel, backgroundInput],
                class: 'ck-table-form__background-row',
            })
        );
        // Dimensions row and padding.
        this.children.add(
            new FormRowView(locale, {
                children: [
                    // Dimensions row.
                    new FormRowView(locale, {
                        labelView: dimensionsLabel,
                        children: [dimensionsLabel, widthInput, operatorLabel, heightInput],
                        class: 'ck-table-form__dimensions-row',
                    }),
                    // Padding row.
                    new FormRowView(locale, {
                        children: [this.paddingInput],
                        class: 'ck-table-cell-properties-form__padding-row',
                    }),
                ],
            })
        );
        // Text alignment row.
        this.children.add(
            new FormRowView(locale, {
                labelView: alignmentLabel,
                children: [alignmentLabel, horizontalAlignmentToolbar, verticalAlignmentToolbar],
                class: 'ck-table-cell-properties-form__alignment-row',
            })
        );

        // Create a spacer view
        const spacer = new View();
        spacer.setTemplate({
            tag: 'div',
            attributes: {
                class: 'spacer',
                style: 'flex-grow:1;',
            },
        });
        this.children.add(spacer);

        // Preset header.
        this.children.add(
            new FormHeaderView(locale, {
                label: this.t('Presets'),
            })
        );

        this.children.add(
            new FormRowView(locale, {
                children: [this.presetField],
                class: 'ck-table-form__preset-dropdown',
            })
        );

        // Action row.
        this.children.add(
            new FormRowView(locale, {
                children: [this.saveButtonView, this.cancelButtonView],
                class: 'ck-table-form__action-row',
            })
        );
        this.setTemplate({
            tag: 'form',
            attributes: {
                class: ['ck', 'ck-form', 'ck-table-form', 'ck-table-cell-properties-form'],
                // https://github.com/ckeditor/ckeditor5-link/issues/90
                tabindex: '-1',
            },
            children: this.children,
        });
    }

    /**
     * @inheritDoc
     */
    render() {
        super.render();
        // Enable the "submit" event for this view. It can be triggered by the #saveButtonView
        // which is of the "submit" DOM "type".
        submitHandler({
            view: this,
        });
        [
            this.borderStyleDropdown,
            this.borderColorInput,
            this.borderColorInput.fieldView.dropdownView.buttonView,
            this.borderWidthInput,
            this.borderDirectionToolbar,
            this.backgroundInput,
            this.backgroundInput.fieldView.dropdownView.buttonView,
            this.widthInput,
            this.heightInput,
            this.paddingInput,
            this.horizontalAlignmentToolbar,
            this.verticalAlignmentToolbar,
            this.saveButtonView,
            this.cancelButtonView,
        ].forEach((view) => {
            // Register the view as focusable.
            this._focusables.add(view);
            // Register the view in the focus tracker.
            this.focusTracker.add(view.element);
        });
        // Mainly for closing using "Esc" and navigation using "Tab".
        this.keystrokes.listenTo(this.element);
    }

    /**
     * @inheritDoc
     */
    destroy() {
        super.destroy();
        this.focusTracker.destroy();
        this.keystrokes.destroy();
    }

    /**
     * Focuses the fist focusable field in the form.
     */
    focus() {
        this._focusCycler.focusFirst();
    }

    /**
     * Creates the following form fields:
     *
     * * {@link #borderStyleDropdown},
     * * {@link #borderWidthInput},
     * * {@link #borderColorInput}.
     */
    _createBorderFields() {
        const defaultTableCellProperties = this.options.defaultTableCellProperties;
        const defaultBorder = {
            style: defaultTableCellProperties.borderStyle,
            width: defaultTableCellProperties.borderWidth,
            color: defaultTableCellProperties.borderColor,
        };
        const colorInputCreator = getLabeledColorInputCreator({
            colorConfig: this.options.borderColors,
            columns: 5,
            defaultColorValue: defaultBorder.color,
        });
        const locale = this.locale;
        const t = this.t;
        // -- Group label ---------------------------------------------
        const borderRowLabel = new LabelView(locale);
        borderRowLabel.text = t('Border');
        // -- Style ---------------------------------------------------
        const styleLabels = getBorderStyleLabels(t);
        const borderStyleDropdown = new LabeledFieldView(locale, createLabeledDropdown);
        borderStyleDropdown.set({
            label: t('Style'),
            class: 'ck-table-form__border-style',
        });
        borderStyleDropdown.fieldView.buttonView.set({
            isOn: false,
            withText: true,
            tooltip: t('Style'),
        });
        borderStyleDropdown.fieldView.buttonView.bind('label').to(this, 'borderStyle', (value) => {
            return styleLabels[value ? value : 'none'];
        });
        borderStyleDropdown.fieldView.on('execute', (evt) => {
            switch (this.borderDirection) {
                case 'full':
                    this.borderStyle = evt.source._borderStyleValue;
                    this.borderTopStyle = evt.source._borderStyleValue;
                    this.borderRightStyle = evt.source._borderStyleValue;
                    this.borderBottomStyle = evt.source._borderStyleValue;
                    this.borderLeftStyle = evt.source._borderStyleValue;
                    break;
                case 'top':
                    this.borderTopStyle = evt.source._borderStyleValue;
                    break;
                case 'right':
                    this.borderRightStyle = evt.source._borderStyleValue;
                    break;
                case 'bottom':
                    this.borderBottomStyle = evt.source._borderStyleValue;
                    break;
                case 'left':
                    this.borderLeftStyle = evt.source._borderStyleValue;
                    break;
                default:
                    this.borderStyle = evt.source._borderStyleValue;
                    break;
            }
        });

        borderStyleDropdown.bind('isEmpty').to(this, 'borderStyle', (value) => !value);

        addListToDropdown(borderStyleDropdown.fieldView, getBorderStyleDefinitions(this, defaultBorder.style));
        // -- Width ---------------------------------------------------
        const borderWidthInput = new LabeledFieldView(locale, createLabeledInputText);
        borderWidthInput.set({
            label: t('Width'),
            class: 'ck-table-form__border-width',
        });
        borderWidthInput.fieldView.bind('value').to(this, 'borderWidth');
        borderWidthInput.bind('isEnabled').to(this, 'borderStyle', isBorderStyleSet);
        borderWidthInput.fieldView.on('input', () => {
            switch (this.borderDirection) {
                case 'full':
                    this.borderWidth = borderWidthInput.fieldView.element.value;
                    this.borderTopWidth = borderWidthInput.fieldView.element.value;
                    this.borderRightWidth = borderWidthInput.fieldView.element.value;
                    this.borderBottomWidth = borderWidthInput.fieldView.element.value;
                    this.borderLeftWidth = borderWidthInput.fieldView.element.value;
                    break;
                case 'top':
                    this.borderTopWidth = borderWidthInput.fieldView.element.value;
                    break;
                case 'right':
                    this.borderRightWidth = borderWidthInput.fieldView.element.value;
                    break;
                case 'bottom':
                    this.borderBottomWidth = borderWidthInput.fieldView.element.value;
                    break;
                case 'left':
                    this.borderLeftWidth = borderWidthInput.fieldView.element.value;
                    break;
                default:
                    this.borderWidth = borderWidthInput.fieldView.element.value;
                    break;
            }
        });
        // -- Color ---------------------------------------------------
        const borderColorInput = new LabeledFieldView(locale, colorInputCreator);
        borderColorInput.set({
            label: t('Color'),
            class: 'ck-table-form__border-color',
        });
        borderColorInput.fieldView.bind('value').to(this, 'borderColor');
        borderColorInput.bind('isEnabled').to(this, 'borderStyle', isBorderStyleSet);
        borderColorInput.fieldView.on('input', () => {
            switch (this.borderDirection) {
                case 'full':
                    this.borderColor = borderColorInput.fieldView.value;
                    this.borderTopColor = borderColorInput.fieldView.value;
                    this.borderRightColor = borderColorInput.fieldView.value;
                    this.borderBottomColor = borderColorInput.fieldView.value;
                    this.borderLeftColor = borderColorInput.fieldView.value;
                    break;
                case 'top':
                    this.borderTopColor = borderColorInput.fieldView.value;
                    break;
                case 'right':
                    this.borderRightColor = borderColorInput.fieldView.value;
                    break;
                case 'bottom':
                    this.borderBottomColor = borderColorInput.fieldView.value;
                    break;
                case 'left':
                    this.borderLeftColor = borderColorInput.fieldView.value;
                    break;
                default:
                    this.borderColor = borderColorInput.fieldView.value;
                    break;
            }
        });
        // Reset the border color and width fields depending on the `border-style` value.
        this.on('change:borderStyle', (evt, name, newValue, oldValue) => {
            // When removing the border (`border-style:none`), clear the remaining `border-*` properties.
            // See: https://github.com/ckeditor/ckeditor5/issues/6227.
            if (!isBorderStyleSet(newValue)) {
                this.borderColor = '';
                this.borderTopColor = '';
                this.borderRightColor = '';
                this.borderBottomColor = '';
                this.borderLeftColor = '';

                this.borderWidth = '';
                this.borderTopWidth = '';
                this.borderRightWidth = '';
                this.borderBottomWidth = '';
                this.borderLeftWidth = '';
            }
            // When setting the `border-style` from `none`, set the default `border-color` and `border-width` properties.
            if (!isBorderStyleSet(oldValue)) {
                this.borderColor = defaultBorder.color;
                this.borderTopColor = defaultBorder.color;
                this.borderRightColor = defaultBorder.color;
                this.borderBottomColor = defaultBorder.color;
                this.borderLeftColor = defaultBorder.color;

                this.borderWidth = defaultBorder.width;
                this.borderTopWidth = defaultBorder.width;
                this.borderRightWidth = defaultBorder.width;
                this.borderBottomWidth = defaultBorder.width;
                this.borderLeftWidth = defaultBorder.width;
            }
        });

        // -- Border Direction ---------------------------------------------------

        const borderDirectionToolbar = new ToolbarView(locale);

        borderDirectionToolbar.set({
            isCompact: true,
            ariaLabel: 'Border Direction toolbar',
        });

        const directionalButtons = { full: 'full', top: 'top', right: 'right', bottom: 'bottom', left: 'left' };
        for (const name in directionalButtons) {
            const button = new ButtonView(this.locale);
            button.set({
                label: directionalButtons[name],
                icon: DIRECTION_ICONS[name],
                tooltip: directionalButtons[name],
            });
            const buttonValue = name;
            button.bind('isOn').to(this, 'borderDirection', (value) => {
                let valueToCompare = value;
                if (value === '' && this.options.defaultTableCellProperties.borderDirection)
                    valueToCompare = this.options.defaultTableCellProperties.borderDirection;

                return buttonValue === valueToCompare;
            });
            button.on('execute', () => {
                this['borderDirection'] = buttonValue;

                // unbind the current inputs
                borderStyleDropdown.unbind('isEmpty');
                borderStyleDropdown.fieldView.buttonView.unbind('label');
                borderWidthInput.fieldView.unbind('value');
                borderWidthInput.unbind('isEnabled');
                borderColorInput.fieldView.unbind('value');
                borderColorInput.unbind('isEnabled');

                const bindBorderProperties = (property, style, color, width) => {
                    borderStyleDropdown.bind('isEmpty').to(this, property, (value) => !value);
                    borderStyleDropdown.fieldView.buttonView
                        .bind('label')
                        .to(this, property, (value) => styleLabels[value ? value : 'none']);
                    borderWidthInput.bind('isEnabled').to(this, property, isBorderStyleSet);
                    borderColorInput.fieldView.bind('value').to(this, color);
                    borderColorInput.bind('isEnabled').to(this, property, isBorderStyleSet);
                    borderWidthInput.fieldView.bind('value').to(this, width);
                };

                switch (buttonValue) {
                    case 'full':
                        bindBorderProperties('borderStyle', 'borderStyle', 'borderColor', 'borderWidth');
                        break;
                    case 'top':
                        bindBorderProperties('borderTopStyle', 'borderTopStyle', 'borderTopColor', 'borderTopWidth');
                        break;
                    case 'right':
                        bindBorderProperties(
                            'borderRightStyle',
                            'borderRightStyle',
                            'borderRightColor',
                            'borderRightWidth'
                        );
                        break;
                    case 'bottom':
                        bindBorderProperties(
                            'borderBottomStyle',
                            'borderBottomStyle',
                            'borderBottomColor',
                            'borderBottomWidth'
                        );
                        break;
                    case 'left':
                        bindBorderProperties(
                            'borderLeftStyle',
                            'borderLeftStyle',
                            'borderLeftColor',
                            'borderLeftWidth'
                        );
                        break;
                    default:
                        bindBorderProperties('borderStyle', 'borderStyle', 'borderColor', 'borderWidth');
                        break;
                }
            });
            borderDirectionToolbar.items.add(button);
        }

        return {
            borderRowLabel,
            borderStyleDropdown,
            borderColorInput,
            borderWidthInput,
            borderDirectionToolbar,
        };
    }

    /**
     * Creates the following form fields:
     *
     * * {@link #backgroundInput}.
     */
    _createBackgroundFields() {
        const locale = this.locale;
        const t = this.t;
        // -- Group label ---------------------------------------------
        const backgroundRowLabel = new LabelView(locale);
        backgroundRowLabel.text = t('Background');
        // -- Background color input -----------------------------------
        const colorInputCreator = getLabeledColorInputCreator({
            colorConfig: this.options.backgroundColors,
            columns: 5,
            defaultColorValue: this.options.defaultTableCellProperties.backgroundColor,
        });
        const backgroundInput = new LabeledFieldView(locale, colorInputCreator);
        backgroundInput.set({
            label: t('Color'),
            class: 'ck-table-cell-properties-form__background',
        });
        backgroundInput.fieldView.bind('value').to(this, 'backgroundColor');
        backgroundInput.fieldView.on('input', () => {
            this.backgroundColor = backgroundInput.fieldView.value;
        });
        return {
            backgroundRowLabel,
            backgroundInput,
        };
    }

    /**
     * Creates the following form fields:
     *
     * * {@link #widthInput}.
     * * {@link #heightInput}.
     */
    _createDimensionFields() {
        const locale = this.locale;
        const t = this.t;
        // -- Label ---------------------------------------------------
        const dimensionsLabel = new LabelView(locale);
        dimensionsLabel.text = t('Dimensions');
        // -- Width ---------------------------------------------------
        const widthInput = new LabeledFieldView(locale, createLabeledInputText);
        widthInput.set({
            label: t('Width'),
            class: 'ck-table-form__dimensions-row__width',
        });
        widthInput.fieldView.bind('value').to(this, 'width');
        widthInput.fieldView.on('input', () => {
            this.width = widthInput.fieldView.element.value;
        });
        // -- Operator ---------------------------------------------------
        const operatorLabel = new View(locale);
        operatorLabel.setTemplate({
            tag: 'span',
            attributes: {
                class: ['ck-table-form__dimension-operator'],
            },
            children: [{ text: '×' }],
        });
        // -- Height ---------------------------------------------------
        const heightInput = new LabeledFieldView(locale, createLabeledInputText);
        heightInput.set({
            label: t('Height'),
            class: 'ck-table-form__dimensions-row__height',
        });
        heightInput.fieldView.bind('value').to(this, 'height');
        heightInput.fieldView.on('input', () => {
            this.height = heightInput.fieldView.element.value;
        });
        return {
            dimensionsLabel,
            widthInput,
            operatorLabel,
            heightInput,
        };
    }

    /**
     * Creates the following form fields:
     *
     * * {@link #paddingInput}.
     */
    _createPaddingField() {
        const locale = this.locale;
        const t = this.t;
        const paddingInput = new LabeledFieldView(locale, createLabeledInputText);
        paddingInput.set({
            label: t('Padding'),
            class: 'ck-table-cell-properties-form__padding',
        });
        paddingInput.fieldView.bind('value').to(this, 'padding');
        paddingInput.fieldView.on('input', () => {
            this.padding = paddingInput.fieldView.element.value;
        });
        return paddingInput;
    }

    /**
     * Creates the following form fields:
     *
     * * {@link #horizontalAlignmentToolbar},
     * * {@link #verticalAlignmentToolbar}.
     */
    _createAlignmentFields() {
        const locale = this.locale;
        const t = this.t;
        const alignmentLabel = new LabelView(locale);
        alignmentLabel.text = t('Table cell text alignment');
        // -- Horizontal ---------------------------------------------------
        const horizontalAlignmentToolbar = new ToolbarView(locale);
        const isContentRTL = locale.contentLanguageDirection === 'rtl';
        horizontalAlignmentToolbar.set({
            isCompact: true,
            ariaLabel: t('Horizontal text alignment toolbar'),
        });
        fillToolbar({
            view: this,
            icons: ALIGNMENT_ICONS,
            toolbar: horizontalAlignmentToolbar,
            labels: this._horizontalAlignmentLabels,
            propertyName: 'horizontalAlignment',
            nameToValue: (name) => {
                // For the RTL content, we want to swap the buttons "align to the left" and "align to the right".
                if (isContentRTL) {
                    if (name === 'left') {
                        return 'right';
                    } else if (name === 'right') {
                        return 'left';
                    }
                }
                return name;
            },
            defaultValue: this.options.defaultTableCellProperties.horizontalAlignment,
        });
        // -- Vertical -----------------------------------------------------
        const verticalAlignmentToolbar = new ToolbarView(locale);
        verticalAlignmentToolbar.set({
            isCompact: true,
            ariaLabel: t('Vertical text alignment toolbar'),
        });
        fillToolbar({
            view: this,
            icons: ALIGNMENT_ICONS,
            toolbar: verticalAlignmentToolbar,
            labels: this._verticalAlignmentLabels,
            propertyName: 'verticalAlignment',
            defaultValue: this.options.defaultTableCellProperties.verticalAlignment,
        });
        return {
            horizontalAlignmentToolbar,
            verticalAlignmentToolbar,
            alignmentLabel,
        };
    }

    /**
     * Creates the preset dropdown form fields:
     */
    createPresetField() {
        const locale = this.locale;
        const t = this.t;
        const presetDropdown = new LabeledFieldView(locale, createLabeledDropdown);

        presetDropdown.set({
            label: t('Style'),
            class: 'ck-table-preset-style',
        });

        presetDropdown.fieldView.buttonView.set({
            isOn: false,
            withText: true,
            tooltip: t('Apply preset styles to cell'),
        });

        presetDropdown.fieldView.buttonView
            .bind('label')
            .to(this, 'preset', (value) => (value === 'header' ? t('Header row') : t('None')));

        presetDropdown.fieldView.on('execute', (evt) => {
            this.preset = evt.source._preset;
        });

        presetDropdown.bind('isEmpty').to(this, 'preset', (value) => !value);

        addListToDropdown(presetDropdown.fieldView, this.getPresetDefinitions(this));

        return presetDropdown;
    }

    getPresetDefinitions(view) {
        const itemDefinitions = new Collection();

        itemDefinitions.add({
            type: 'button',
            model: new Model({
                _preset: 'none',
                label: 'None',
                withText: true,
                isOn: this.preset === 'none',
                isEnabled: this.preset !== 'none',
            }),
        });

        itemDefinitions.add({
            type: 'button',
            model: new Model({
                _preset: 'header',
                label: 'Header row',
                withText: true,
                isOn: this.preset === 'header',
                isEnabled: this.preset !== 'header',
            }),
        });

        return itemDefinitions;
    }

    /**
     * Creates the following form controls:
     *
     * * {@link #saveButtonView},
     * * {@link #cancelButtonView}.
     */
    _createActionButtons() {
        const locale = this.locale;
        const t = this.t;
        const saveButtonView = new ButtonView(locale);
        const cancelButtonView = new ButtonView(locale);
        const fieldsThatShouldValidateToSave = [
            this.borderWidthInput,
            this.borderColorInput,
            this.backgroundInput,
            this.paddingInput,
        ];
        saveButtonView.set({
            label: t('Save'),
            icon: icons.check,
            class: 'ck-button-save',
            type: 'submit',
            withText: true,
        });
        saveButtonView.bind('isEnabled').toMany(fieldsThatShouldValidateToSave, 'errorText', (...errorTexts) => {
            return errorTexts.every((errorText) => !errorText);
        });
        cancelButtonView.set({
            label: t('Cancel'),
            icon: icons.cancel,
            class: 'ck-button-cancel',
            withText: true,
        });
        cancelButtonView.delegate('execute').to(this, 'cancel');
        return {
            saveButtonView,
            cancelButtonView,
        };
    }

    /**
     * Provides localized labels for {@link #horizontalAlignmentToolbar} buttons.
     */
    get _horizontalAlignmentLabels() {
        const locale = this.locale;
        const t = this.t;
        const left = t('Align cell text to the left');
        const center = t('Align cell text to the center');
        const right = t('Align cell text to the right');
        const justify = t('Justify cell text');
        // Returns object with a proper order of labels.
        if (locale.uiLanguageDirection === 'rtl') {
            return { right, center, left, justify };
        } else {
            return { left, center, right, justify };
        }
    }

    /**
     * Provides localized labels for {@link #verticalAlignmentToolbar} buttons.
     */
    get _verticalAlignmentLabels() {
        const t = this.t;
        return {
            top: t('Align cell text to the top'),
            middle: t('Align cell text to the middle'),
            bottom: t('Align cell text to the bottom'),
        };
    }
}

function isBorderStyleSet(value) {
    return value !== 'none';
}

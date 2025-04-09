/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module table/tablecellproperties/tablecellpropertiesediting
 */
import { Plugin } from 'ckeditor5/src/core';
import { addBackgroundRules, addBorderRules, addPaddingRules } from 'ckeditor5/src/engine';
import { downcastAttributeToStyle, upcastBorderStyles } from '../converters/tableproperties';
import TableEditing from '../tableediting';
import TableCellWidthEditing from '../tablecellwidth/tablecellwidthediting';
import TableCellPaddingCommand from './commands/tablecellpaddingcommand';
import TableCellHeightCommand from './commands/tablecellheightcommand';
import TableCellBackgroundColorCommand from './commands/tablecellbackgroundcolorcommand';
import TableCellVerticalAlignmentCommand from './commands/tablecellverticalalignmentcommand';
import TableCellHorizontalAlignmentCommand from './commands/tablecellhorizontalalignmentcommand';
import TableCellBorderStyleCommand from './commands/tablecellborderstylecommand';
import TableCellBorderColorCommand from './commands/tablecellbordercolorcommand';
import TableCellBorderWidthCommand from './commands/tablecellborderwidthcommand';
import { getNormalizedDefaultProperties } from '../utils/table-properties';
import { enableProperty } from '../utils/common';

import TableCellBorderLeftStyleCommand from './commands/tablecellborderleftstylecommand';
import TableCellBorderLeftColorCommand from './commands/tablecellborderleftcolorcommand';
import TableCellBorderLeftWidthCommand from './commands/tablecellborderleftwidthcommand';

import TableCellBorderTopStyleCommand from './commands/tablecellbordertopstylecommand';
import TableCellBorderTopColorCommand from './commands/tablecellbordertopcolorcommand';
import TableCellBorderTopWidthCommand from './commands/tablecellbordertopwidthcommand';

import TableCellBorderRightStyleCommand from './commands/tablecellborderrightstylecommand';
import TableCellBorderRightColorCommand from './commands/tablecellborderrightcolorcommand';
import TableCellBorderRightWidthCommand from './commands/tablecellborderrightwidthcommand';

import TableCellBorderBottomStyleCommand from './commands/tablecellborderbottomstylecommand';
import TableCellBorderBottomColorCommand from './commands/tablecellborderbottomcolorcommand';
import TableCellBorderBottomWidthCommand from './commands/tablecellborderbottomwidthcommand';
import TableCellPresetCommand from './commands/tablecellpresetcommand';

const VALIGN_VALUES_REG_EXP = /^(top|middle|bottom)$/;
const ALIGN_VALUES_REG_EXP = /^(left|center|right|justify)$/;
/**
 * The table cell properties editing feature.
 *
 * Introduces table cell model attributes and their conversion:
 *
 * - border: `tableCellBorderStyle`, `tableCellBorderColor` and `tableCellBorderWidth`
 * - background color: `tableCellBackgroundColor`
 * - cell padding: `tableCellPadding`
 * - horizontal and vertical alignment: `tableCellHorizontalAlignment`, `tableCellVerticalAlignment`
 * - cell width and height: `tableCellWidth`, `tableCellHeight`
 *
 * It also registers commands used to manipulate the above attributes:
 *
 * - border: the `'tableCellBorderStyle'`, `'tableCellBorderColor'` and `'tableCellBorderWidth'` commands
 * - background color: the `'tableCellBackgroundColor'` command
 * - cell padding: the `'tableCellPadding'` command
 * - horizontal and vertical alignment: the `'tableCellHorizontalAlignment'` and `'tableCellVerticalAlignment'` commands
 * - width and height: the `'tableCellWidth'` and `'tableCellHeight'` commands
 */
export default class TableCellPropertiesEditing extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'TableCellPropertiesEditing';
    }

    /**
     * @inheritDoc
     */
    static get requires() {
        return [TableEditing, TableCellWidthEditing];
    }

    /**
     * @inheritDoc
     */
    init() {
        const editor = this.editor;
        const schema = editor.model.schema;
        const conversion = editor.conversion;
        editor.config.define('table.tableCellProperties.defaultProperties', {});
        const defaultTableCellProperties = getNormalizedDefaultProperties(
            editor.config.get('table.tableCellProperties.defaultProperties'),
            {
                includeVerticalAlignmentProperty: true,
                includeHorizontalAlignmentProperty: true,
                includePaddingProperty: true,
                isRightToLeftContent: editor.locale.contentLanguageDirection === 'rtl',
            }
        );
        editor.data.addStyleProcessorRules(addBorderRules);
        enableBorderProperties(schema, conversion, {
            color: defaultTableCellProperties.borderColor,
            style: defaultTableCellProperties.borderStyle,
            width: defaultTableCellProperties.borderWidth,
        });
        editor.commands.add(
            'tableCellBorderStyle',
            new TableCellBorderStyleCommand(editor, defaultTableCellProperties.borderStyle)
        );
        editor.commands.add(
            'tableCellBorderColor',
            new TableCellBorderColorCommand(editor, defaultTableCellProperties.borderColor)
        );
        editor.commands.add(
            'tableCellBorderWidth',
            new TableCellBorderWidthCommand(editor, defaultTableCellProperties.borderWidth)
        );

        enableBorderDirectionalProperties(
            schema,
            conversion,
            {
                color: defaultTableCellProperties.borderTopColor,
                style: defaultTableCellProperties.borderTopStyle,
                width: defaultTableCellProperties.borderTopWidth,
            },
            'Top'
        );
        editor.commands.add(
            'tableCellBorderTopStyle',
            new TableCellBorderTopStyleCommand(editor, defaultTableCellProperties.borderTopStyle)
        );
        editor.commands.add(
            'tableCellBorderTopColor',
            new TableCellBorderTopColorCommand(editor, defaultTableCellProperties.borderTopColor)
        );
        editor.commands.add(
            'tableCellBorderTopWidth',
            new TableCellBorderTopWidthCommand(editor, defaultTableCellProperties.borderTopWidth)
        );

        enableBorderDirectionalProperties(
            schema,
            conversion,
            {
                color: defaultTableCellProperties.borderRightColor,
                style: defaultTableCellProperties.borderRightStyle,
                width: defaultTableCellProperties.borderRightWidth,
            },
            'Right'
        );
        editor.commands.add(
            'tableCellBorderRightStyle',
            new TableCellBorderRightStyleCommand(editor, defaultTableCellProperties.borderRightStyle)
        );
        editor.commands.add(
            'tableCellBorderRightColor',
            new TableCellBorderRightColorCommand(editor, defaultTableCellProperties.borderRightColor)
        );
        editor.commands.add(
            'tableCellBorderRightWidth',
            new TableCellBorderRightWidthCommand(editor, defaultTableCellProperties.borderRightWidth)
        );

        enableBorderDirectionalProperties(
            schema,
            conversion,
            {
                color: defaultTableCellProperties.borderBottomColor,
                style: defaultTableCellProperties.borderBottomStyle,
                width: defaultTableCellProperties.borderBottomWidth,
            },
            'Bottom'
        );
        editor.commands.add(
            'tableCellBorderBottomStyle',
            new TableCellBorderBottomStyleCommand(editor, defaultTableCellProperties.borderBottomStyle)
        );
        editor.commands.add(
            'tableCellBorderBottomColor',
            new TableCellBorderBottomColorCommand(editor, defaultTableCellProperties.borderBottomColor)
        );
        editor.commands.add(
            'tableCellBorderBottomWidth',
            new TableCellBorderBottomWidthCommand(editor, defaultTableCellProperties.borderBottomWidth)
        );

        enableBorderDirectionalProperties(
            schema,
            conversion,
            {
                color: defaultTableCellProperties.borderLeftColor,
                style: defaultTableCellProperties.borderLeftStyle,
                width: defaultTableCellProperties.borderLeftWidth,
            },
            'Left'
        );
        editor.commands.add(
            'tableCellBorderLeftStyle',
            new TableCellBorderLeftStyleCommand(editor, defaultTableCellProperties.borderLeftStyle)
        );
        editor.commands.add(
            'tableCellBorderLeftColor',
            new TableCellBorderLeftColorCommand(editor, defaultTableCellProperties.borderLeftColor)
        );
        editor.commands.add(
            'tableCellBorderLeftWidth',
            new TableCellBorderLeftWidthCommand(editor, defaultTableCellProperties.borderLeftWidth)
        );

        enableProperty(schema, conversion, {
            modelAttribute: 'tableCellHeight',
            styleName: 'height',
            defaultValue: defaultTableCellProperties.height,
        });
        editor.commands.add('tableCellHeight', new TableCellHeightCommand(editor, defaultTableCellProperties.height));
        editor.data.addStyleProcessorRules(addPaddingRules);
        enableProperty(schema, conversion, {
            modelAttribute: 'tableCellPadding',
            styleName: 'padding',
            reduceBoxSides: true,
            defaultValue: defaultTableCellProperties.padding,
        });
        editor.commands.add(
            'tableCellPadding',
            new TableCellPaddingCommand(editor, defaultTableCellProperties.padding)
        );
        enablePresetProperty(schema, conversion, {
            modelAttribute: 'tableCellPreset',
        });
        editor.commands.add('tableCellPreset', new TableCellPresetCommand(editor, defaultTableCellProperties.preset));
        editor.data.addStyleProcessorRules(addBackgroundRules);
        enableProperty(schema, conversion, {
            modelAttribute: 'tableCellBackgroundColor',
            styleName: 'background-color',
            defaultValue: defaultTableCellProperties.backgroundColor,
        });
        editor.commands.add(
            'tableCellBackgroundColor',
            new TableCellBackgroundColorCommand(editor, defaultTableCellProperties.backgroundColor)
        );
        enableHorizontalAlignmentProperty(schema, conversion, defaultTableCellProperties.horizontalAlignment);
        editor.commands.add(
            'tableCellHorizontalAlignment',
            new TableCellHorizontalAlignmentCommand(editor, defaultTableCellProperties.horizontalAlignment)
        );
        enableVerticalAlignmentProperty(schema, conversion, defaultTableCellProperties.verticalAlignment);
        editor.commands.add(
            'tableCellVerticalAlignment',
            new TableCellVerticalAlignmentCommand(editor, defaultTableCellProperties.verticalAlignment)
        );
    }
}

/**
 * Enables the `'tableCellBorderStyle'`, `'tableCellBorderColor'` and `'tableCellBorderWidth'` attributes for table cells.
 *
 * @param defaultBorder The default border values.
 * @param defaultBorder.color The default `tableCellBorderColor` value.
 * @param defaultBorder.style The default `tableCellBorderStyle` value.
 * @param defaultBorder.width The default `tableCellBorderWidth` value.
 */
function enableBorderProperties(schema, conversion, defaultBorder) {
    const modelAttributes = {
        width: 'tableCellBorderWidth',
        color: 'tableCellBorderColor',
        style: 'tableCellBorderStyle',
    };
    schema.extend('tableCell', {
        allowAttributes: Object.values(modelAttributes),
    });
    upcastBorderStyles(conversion, 'td', modelAttributes, defaultBorder);
    upcastBorderStyles(conversion, 'th', modelAttributes, defaultBorder);
    downcastAttributeToStyle(conversion, {
        modelElement: 'tableCell',
        modelAttribute: modelAttributes.style,
        styleName: 'border-style',
    });
    downcastAttributeToStyle(conversion, {
        modelElement: 'tableCell',
        modelAttribute: modelAttributes.color,
        styleName: 'border-color',
    });
    downcastAttributeToStyle(conversion, {
        modelElement: 'tableCell',
        modelAttribute: modelAttributes.width,
        styleName: 'border-width',
    });
}

function enableBorderDirectionalProperties(schema, conversion, defaultBorder, direction) {
    const modelAttributes = {
        width: `tableCellBorder${direction}Width`,
        color: `tableCellBorder${direction}Color`,
        style: `tableCellBorder${direction}Style`,
    };
    schema.extend('tableCell', {
        allowAttributes: Object.values(modelAttributes),
    });
    upcastBorderStyles(conversion, 'td', modelAttributes, defaultBorder);
    upcastBorderStyles(conversion, 'th', modelAttributes, defaultBorder);
    downcastAttributeToStyle(conversion, {
        modelElement: 'tableCell',
        modelAttribute: modelAttributes.style,
        styleName: `border-${direction.toLowerCase()}-style`,
    });
    downcastAttributeToStyle(conversion, {
        modelElement: 'tableCell',
        modelAttribute: modelAttributes.color,
        styleName: `border-${direction.toLowerCase()}-color`,
    });
    downcastAttributeToStyle(conversion, {
        modelElement: 'tableCell',
        modelAttribute: modelAttributes.width,
        styleName: `border-${direction.toLowerCase()}-width`,
    });
}

/**
 * Enables the `'tableCellHorizontalAlignment'` attribute for table cells.
 *
 * @param defaultValue The default horizontal alignment value.
 */
function enableHorizontalAlignmentProperty(schema, conversion, defaultValue) {
    schema.extend('tableCell', {
        allowAttributes: ['tableCellHorizontalAlignment'],
    });
    conversion.for('downcast').attributeToAttribute({
        model: {
            name: 'tableCell',
            key: 'tableCellHorizontalAlignment',
        },
        view: (alignment) => ({
            key: 'style',
            value: {
                'text-align': alignment,
            },
        }),
    });
    conversion
        .for('upcast')
        // Support for the `text-align:*;` CSS definition for the table cell alignment.
        .attributeToAttribute({
            view: {
                name: /^(td|th)$/,
                styles: {
                    'text-align': ALIGN_VALUES_REG_EXP,
                },
            },
            model: {
                key: 'tableCellHorizontalAlignment',
                value: (viewElement) => {
                    const align = viewElement.getStyle('text-align');
                    return align === defaultValue ? null : align;
                },
            },
        })
        // Support for the `align` attribute as the backward compatibility while pasting from other sources.
        .attributeToAttribute({
            view: {
                name: /^(td|th)$/,
                attributes: {
                    align: ALIGN_VALUES_REG_EXP,
                },
            },
            model: {
                key: 'tableCellHorizontalAlignment',
                value: (viewElement) => {
                    const align = viewElement.getAttribute('align');
                    return align === defaultValue ? null : align;
                },
            },
        });
}

/**
 * Enables the `'verticalAlignment'` attribute for table cells.
 *
 * @param defaultValue The default vertical alignment value.
 */
function enableVerticalAlignmentProperty(schema, conversion, defaultValue) {
    schema.extend('tableCell', {
        allowAttributes: ['tableCellVerticalAlignment'],
    });
    conversion.for('downcast').attributeToAttribute({
        model: {
            name: 'tableCell',
            key: 'tableCellVerticalAlignment',
        },
        view: (alignment) => ({
            key: 'style',
            value: {
                'vertical-align': alignment,
            },
        }),
    });
    conversion
        .for('upcast')
        // Support for the `vertical-align:*;` CSS definition for the table cell alignment.
        .attributeToAttribute({
            view: {
                name: /^(td|th)$/,
                styles: {
                    'vertical-align': VALIGN_VALUES_REG_EXP,
                },
            },
            model: {
                key: 'tableCellVerticalAlignment',
                value: (viewElement) => {
                    const align = viewElement.getStyle('vertical-align');
                    return align === defaultValue ? null : align;
                },
            },
        })
        // Support for the `align` attribute as the backward compatibility while pasting from other sources.
        .attributeToAttribute({
            view: {
                name: /^(td|th)$/,
                attributes: {
                    valign: VALIGN_VALUES_REG_EXP,
                },
            },
            model: {
                key: 'tableCellVerticalAlignment',
                value: (viewElement) => {
                    const valign = viewElement.getAttribute('valign');
                    return valign === defaultValue ? null : valign;
                },
            },
        });
}

/**
 * Enables conversion for an attribute for simple view-model mappings.
 *
 * @param options.defaultValue The default value for the specified `modelAttribute`.
 */
function enablePresetProperty(schema, conversion, options) {
    const { modelAttribute } = options;
    schema.extend('tableCell', {
        allowAttributes: [modelAttribute],
    });

    upcastClassToAttribute(conversion, { viewElement: /^(td|th)$/, ...options });
    downcastAttributeToClass(conversion, { modelElement: 'tableCell', ...options });
}

function downcastAttributeToClass(conversion, options) {
    const { modelElement, modelAttribute, classNamePrefix = 'preset-' } = options;

    conversion.for('downcast').attributeToAttribute({
        model: {
            name: modelElement,
            key: modelAttribute,
        },
        view: (modelAttributeValue) => ({
            key: 'class',
            value: `${classNamePrefix}${modelAttributeValue}`,
        }),
    });
}

function upcastClassToAttribute(conversion, options) {
    const { modelAttribute, viewElement, classNamePrefix = 'preset-', shouldUpcast = () => true } = options;

    conversion.for('upcast').attributeToAttribute({
        view: {
            name: viewElement,
        },
        model: {
            name: viewElement,
            key: modelAttribute,
            value: (viewElement) => {
                if (!shouldUpcast(viewElement)) return;

                // Find a class that starts with the given prefix.
                const classList = Array.from(viewElement.getClassNames());
                const matchedClass = classList.find((className) => className.startsWith(classNamePrefix));

                if (!matchedClass || !shouldUpcast(viewElement)) return;

                // get the actual preset value (no 'preset-')
                return matchedClass.replace(classNamePrefix, '');
            },
        },
    });
}

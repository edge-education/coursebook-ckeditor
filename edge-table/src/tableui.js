/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module table/tableui
 */
import { Plugin } from 'ckeditor5/src/core';
import { addListToDropdown, createDropdown, Model, SplitButtonView, SwitchButtonView } from 'ckeditor5/src/ui';
import { Collection } from 'ckeditor5/src/utils';
import tableColumnIcon from '../theme/icons/table-column.svg';
import tableRowIcon from '../theme/icons/table-row.svg';
import tableMergeCellIcon from '../theme/icons/table-merge-cell.svg';
import tableIcon from '../theme/icons/table.svg';
import InsertTableView from './ui/inserttableview';
import InsertTableTemplateView from './ui/inserttabletemplateview';

/**
 * The table UI plugin. It introduces:
 *
 * * The `'insertTable'` dropdown,
 * * The `'tableColumn'` dropdown,
 * * The `'tableRow'` dropdown,
 * * The `'mergeTableCells'` split button.
 *
 * The `'tableColumn'`, `'tableRow'` and `'mergeTableCells'` dropdowns work best with {@link module:table/tabletoolbar~TableToolbar}.
 */
export default class TableUI extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'TableUI';
    }

    /**
     * @inheritDoc
     */
    init() {
        const editor = this.editor;
        const t = this.editor.t;
        const contentLanguageDirection = editor.locale.contentLanguageDirection;
        const isContentLtr = contentLanguageDirection === 'ltr';
        // Insert Table
        editor.ui.componentFactory.add('insertTable', (locale) => {
            const command = editor.commands.get('insertTable');
            const dropdownView = createDropdown(locale);
            dropdownView.bind('isEnabled').to(command);
            // Decorate dropdown's button.
            dropdownView.buttonView.set({
                icon: tableIcon,
                label: t('Insert table'),
                tooltip: true,
            });

            let insertTableView, insertTableTemplateView;
            dropdownView.on('change:isOpen', () => {
                if (insertTableView && insertTableTemplateView) {
                    return;
                }

                insertTableView = new InsertTableView(locale);
                insertTableTemplateView = new InsertTableTemplateView(locale);

                dropdownView.panelView.children.add(insertTableView);
                dropdownView.panelView.children.add(insertTableTemplateView);

                insertTableView.delegate('execute-grid').to(dropdownView);
                insertTableTemplateView.delegate('execute-template').to(dropdownView);

                dropdownView.on('execute-grid', () => {
                    editor.execute('insertTable', { rows: insertTableView.rows, columns: insertTableView.columns });
                    editor.editing.view.focus();
                });
                dropdownView.on('execute-template', (event, templateHtml) => {
                    editor.execute('insertTableTemplate', templateHtml);
                    editor.editing.view.focus();
                });
            });

            return dropdownView;
        });
        editor.ui.componentFactory.add('tableColumn', (locale) => {
            const options = [
                {
                    type: 'switchbutton',
                    model: {
                        commandName: 'setTableColumnHeader',
                        label: t('Header column'),
                        bindIsOn: true,
                    },
                },
                { type: 'separator' },
                {
                    type: 'button',
                    model: {
                        commandName: isContentLtr ? 'insertTableColumnLeft' : 'insertTableColumnRight',
                        label: t('Insert column left'),
                    },
                },
                {
                    type: 'button',
                    model: {
                        commandName: isContentLtr ? 'insertTableColumnRight' : 'insertTableColumnLeft',
                        label: t('Insert column right'),
                    },
                },
                {
                    type: 'button',
                    model: {
                        commandName: 'removeTableColumn',
                        label: t('Delete column'),
                    },
                },
                {
                    type: 'button',
                    model: {
                        commandName: 'selectTableColumn',
                        label: t('Select column'),
                    },
                },
            ];
            return this._prepareDropdown(t('Column'), tableColumnIcon, options, locale);
        });
        editor.ui.componentFactory.add('tableRow', (locale) => {
            const options = [
                {
                    type: 'switchbutton',
                    model: {
                        commandName: 'setTableRowHeader',
                        label: t('Header row'),
                        bindIsOn: true,
                    },
                },
                { type: 'separator' },
                {
                    type: 'button',
                    model: {
                        commandName: 'insertTableRowAbove',
                        label: t('Insert row above'),
                    },
                },
                {
                    type: 'button',
                    model: {
                        commandName: 'insertTableRowBelow',
                        label: t('Insert row below'),
                    },
                },
                {
                    type: 'button',
                    model: {
                        commandName: 'removeTableRow',
                        label: t('Delete row'),
                    },
                },
                {
                    type: 'button',
                    model: {
                        commandName: 'selectTableRow',
                        label: t('Select row'),
                    },
                },
            ];
            return this._prepareDropdown(t('Row'), tableRowIcon, options, locale);
        });
        editor.ui.componentFactory.add('mergeTableCells', (locale) => {
            const options = [
                {
                    type: 'button',
                    model: {
                        commandName: 'mergeTableCellUp',
                        label: t('Merge cell up'),
                    },
                },
                {
                    type: 'button',
                    model: {
                        commandName: isContentLtr ? 'mergeTableCellRight' : 'mergeTableCellLeft',
                        label: t('Merge cell right'),
                    },
                },
                {
                    type: 'button',
                    model: {
                        commandName: 'mergeTableCellDown',
                        label: t('Merge cell down'),
                    },
                },
                {
                    type: 'button',
                    model: {
                        commandName: isContentLtr ? 'mergeTableCellLeft' : 'mergeTableCellRight',
                        label: t('Merge cell left'),
                    },
                },
                { type: 'separator' },
                {
                    type: 'button',
                    model: {
                        commandName: 'splitTableCellVertically',
                        label: t('Split cell vertically'),
                    },
                },
                {
                    type: 'button',
                    model: {
                        commandName: 'splitTableCellHorizontally',
                        label: t('Split cell horizontally'),
                    },
                },
            ];
            return this._prepareMergeSplitButtonDropdown(t('Merge cells'), tableMergeCellIcon, options, locale);
        });
    }

    /**
     * Creates a dropdown view from a set of options.
     *
     * @param label The dropdown button label.
     * @param icon An icon for the dropdown button.
     * @param options The list of options for the dropdown.
     */
    _prepareDropdown(label, icon, options, locale) {
        const editor = this.editor;
        const dropdownView = createDropdown(locale);
        const commands = this._fillDropdownWithListOptions(dropdownView, options);
        // Decorate dropdown's button.
        dropdownView.buttonView.set({
            label,
            icon,
            tooltip: true,
        });
        // Make dropdown button disabled when all options are disabled.
        dropdownView.bind('isEnabled').toMany(commands, 'isEnabled', (...areEnabled) => {
            return areEnabled.some((isEnabled) => isEnabled);
        });
        this.listenTo(dropdownView, 'execute', (evt) => {
            editor.execute(evt.source.commandName);
            // Toggling a switch button view should not move the focus to the editable.
            if (!(evt.source instanceof SwitchButtonView)) {
                editor.editing.view.focus();
            }

            if (window.bus) {
                if (evt.source.commandName === 'setTableRowHeader' || evt.source.commandName === 'setTableColumnHeader')
                    window.bus.onRefocusComponent();
            }
        });
        return dropdownView;
    }

    /**
     * Creates a dropdown view with a {@link module:ui/dropdown/button/splitbuttonview~SplitButtonView} for
     * merge (and split)–related commands.
     *
     * @param label The dropdown button label.
     * @param icon An icon for the dropdown button.
     * @param options The list of options for the dropdown.
     */
    _prepareMergeSplitButtonDropdown(label, icon, options, locale) {
        const editor = this.editor;
        const dropdownView = createDropdown(locale, SplitButtonView);
        const mergeCommandName = 'mergeTableCells';
        // Main command.
        const mergeCommand = editor.commands.get(mergeCommandName);
        // Subcommands in the dropdown.
        const commands = this._fillDropdownWithListOptions(dropdownView, options);
        dropdownView.buttonView.set({
            label,
            icon,
            tooltip: true,
            isEnabled: true,
        });
        // Make dropdown button disabled when all options are disabled together with the main command.
        dropdownView.bind('isEnabled').toMany([mergeCommand, ...commands], 'isEnabled', (...areEnabled) => {
            return areEnabled.some((isEnabled) => isEnabled);
        });
        // Merge selected table cells when the main part of the split button is clicked.
        this.listenTo(dropdownView.buttonView, 'execute', () => {
            editor.execute(mergeCommandName);
            editor.editing.view.focus();
        });
        // Execute commands for events coming from the list in the dropdown panel.
        this.listenTo(dropdownView, 'execute', (evt) => {
            editor.execute(evt.source.commandName);
            editor.editing.view.focus();
        });
        return dropdownView;
    }

    /**
     * Injects a {@link module:ui/list/listview~ListView} into the passed dropdown with buttons
     * which execute editor commands as configured in passed options.
     *
     * @param options The list of options for the dropdown.
     * @returns Commands the list options are interacting with.
     */
    _fillDropdownWithListOptions(dropdownView, options) {
        const editor = this.editor;
        const commands = [];
        const itemDefinitions = new Collection();
        for (const option of options) {
            addListOption(option, editor, commands, itemDefinitions);
        }
        addListToDropdown(dropdownView, itemDefinitions);
        return commands;
    }
}

/**
 * Adds an option to a list view.
 *
 * @param option A configuration option.
 * @param commands The list of commands to update.
 * @param itemDefinitions A collection of dropdown items to update with the given option.
 */
function addListOption(option, editor, commands, itemDefinitions) {
    if (option.type === 'button' || option.type === 'switchbutton') {
        const model = (option.model = new Model(option.model));
        const { commandName, bindIsOn } = option.model;
        const command = editor.commands.get(commandName);
        commands.push(command);
        model.set({ commandName });
        model.bind('isEnabled').to(command);
        if (bindIsOn) {
            model.bind('isOn').to(command, 'value');
        }

        model.set({
            withText: true,
        });
    }
    itemDefinitions.add(option);
}

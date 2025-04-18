/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module table/table
 */
import { Plugin } from 'ckeditor5/src/core';
import { Widget } from 'ckeditor5/src/widget';
import TableEditing from './tableediting';
import TableUI from './tableui';
import TableSelection from './tableselection';
import TableClipboard from './tableclipboard';
import TableKeyboard from './tablekeyboard';
import TableMouse from './tablemouse';
import '../theme/table.css';
import '../theme/ckeditor5-table/colorinput.css';
import '../theme/ckeditor5-table/form.css';
import '../theme/ckeditor5-table/formrow.css';
import '../theme/ckeditor5-table/inserttable.css';
import '../theme/ckeditor5-table/tablecellproperties.css';
import '../theme/ckeditor5-table/tableediting.css';
import '../theme/ckeditor5-table/tableform.css';
import '../theme/ckeditor5-table/tableproperties.css';
import '../theme/ckeditor5-table/tableselection.css';

/**
 * The table plugin.
 *
 * For a detailed overview, check the {@glink features/tables/tables Table feature documentation}.
 *
 * This is a "glue" plugin that loads the following table features:
 *
 * * {@link module:table/tableediting~TableEditing editing feature},
 * * {@link module:table/tableselection~TableSelection selection feature},
 * * {@link module:table/tablekeyboard~TableKeyboard keyboard navigation feature},
 * * {@link module:table/tablemouse~TableMouse mouse selection feature},
 * * {@link module:table/tableclipboard~TableClipboard clipboard feature},
 * * {@link module:table/tableui~TableUI UI feature}.
 */
export default class Table extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires() {
        return [TableEditing, TableUI, TableSelection, TableMouse, TableKeyboard, TableClipboard, Widget];
    }

    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'Table';
    }
}

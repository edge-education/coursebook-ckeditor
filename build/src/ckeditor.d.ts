/**
 * @license Copyright (c) 2014-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import { InlineEditor } from '@ckeditor/ckeditor5-editor-inline';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { Bold, Italic, Strikethrough, Subscript, Superscript, Underline } from '@ckeditor/ckeditor5-basic-styles';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import type { EditorConfig } from '@ckeditor/ckeditor5-core';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { FontBackgroundColor, FontColor, FontFamily, FontSize } from '@ckeditor/ckeditor5-font';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line';
import { DataFilter } from '@ckeditor/ckeditor5-html-support';
import { Indent } from '@ckeditor/ckeditor5-indent';
import { Link } from '@ckeditor/ckeditor5-link';
import { RemoveFormat } from '@ckeditor/ckeditor5-remove-format';
import { SelectAll } from '@ckeditor/ckeditor5-select-all';
import { SpecialCharactersEssentials } from '@ckeditor/ckeditor5-special-characters';
import Equations from '../equations/equations';
import Table from '../edge-table/src/table';
import TableCaption from '../edge-table/src/tablecaption';
import TableCellProperties from '../edge-table/src/tablecellproperties';
import TableColumnResize from '../edge-table/src/tablecolumnresize';
import TableProperties from '../edge-table/src/tableproperties';
import TableToolbar from '../edge-table/src/tabletoolbar';
import TextWrap from '../text-wrap/TextWrapPlugin';
import { DocumentList, DocumentListProperties, TodoDocumentList } from '../edge-list/';
declare class Editor extends InlineEditor {
    static builtinPlugins: (typeof Equations | typeof TextWrap | typeof Alignment | typeof Autoformat | typeof BlockQuote | typeof Bold | typeof CloudServices | typeof DataFilter | typeof DocumentList | typeof DocumentListProperties | typeof Essentials | typeof FontBackgroundColor | typeof FontColor | typeof FontFamily | typeof FontSize | typeof Heading | typeof HorizontalLine | typeof Indent | typeof Italic | typeof Link | typeof RemoveFormat | typeof SelectAll | typeof SpecialCharactersEssentials | typeof Strikethrough | typeof Subscript | typeof Superscript | typeof TodoDocumentList | typeof Underline | typeof Table | typeof TableCaption | typeof TableCellProperties | typeof TableColumnResize | typeof TableProperties | typeof TableToolbar)[];
    static defaultConfig: EditorConfig;
    constructor(element: HTMLElement, config: EditorConfig);
    private removeIdAttributes;
}
export default Editor;

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
import { FindAndReplace } from '@ckeditor/ckeditor5-find-and-replace';
import { FontBackgroundColor, FontColor, FontFamily, FontSize } from '@ckeditor/ckeditor5-font';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line';
import { DataFilter, DataSchema, GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';
import { Indent, IndentBlock } from '@ckeditor/ckeditor5-indent';
import { AutoLink, Link } from '@ckeditor/ckeditor5-link';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office';
import { RemoveFormat } from '@ckeditor/ckeditor5-remove-format';
import { SelectAll } from '@ckeditor/ckeditor5-select-all';
import {
    SpecialCharacters,
    SpecialCharactersArrows,
    SpecialCharactersCurrency,
    SpecialCharactersEssentials,
    SpecialCharactersLatin,
    SpecialCharactersMathematical,
    SpecialCharactersText,
} from '@ckeditor/ckeditor5-special-characters';
import { TextTransformation } from '@ckeditor/ckeditor5-typing';
import { Base64UploadAdapter } from '@ckeditor/ckeditor5-upload';
import { WordCount } from '@ckeditor/ckeditor5-word-count';
import Equations from '../equations/equations';
import CbMedia from '../cb-media/cb-media';

import Table from '../edge-table/src/table';
import TableCaption from '../edge-table/src/tablecaption';
import TableCellProperties from '../edge-table/src/tablecellproperties';
import TableColumnResize from '../edge-table/src/tablecolumnresize';
import TableProperties from '../edge-table/src/tableproperties';
import TableToolbar from '../edge-table/src/tabletoolbar';
import TextWrap from '../text-wrap/TextWrapPlugin';
import { DocumentList, DocumentListProperties, TodoDocumentList } from '../edge-list/';

// You can read more about extending the build with additional plugins in the "Installing plugins" guide.
// See https://ckeditor.com/docs/ckeditor5/latest/installation/plugins/installing-plugins.html for details.

class Editor extends InlineEditor {
    public static override builtinPlugins = [
        Alignment,
        AutoLink,
        Autoformat,
        Base64UploadAdapter,
        BlockQuote,
        Bold,
        CloudServices,
        DataFilter,
        DataSchema,
        DocumentList,
        DocumentListProperties,
        Essentials,
        FindAndReplace,
        FontBackgroundColor,
        FontColor,
        FontFamily,
        FontSize,
        GeneralHtmlSupport,
        Heading,
        HorizontalLine,
        Indent,
        IndentBlock,
        Italic,
        Link,
        Paragraph,
        PasteFromOffice,
        RemoveFormat,
        SelectAll,
        SpecialCharacters,
        SpecialCharactersArrows,
        SpecialCharactersCurrency,
        SpecialCharactersEssentials,
        SpecialCharactersLatin,
        SpecialCharactersMathematical,
        SpecialCharactersText,
        Strikethrough,
        Subscript,
        Superscript,
        TextTransformation,
        TodoDocumentList,
        Underline,
        WordCount,
        Equations,
        Table,
        TableCaption,
        TableCellProperties,
        TableColumnResize,
        TableProperties,
        TableToolbar,
        CbMedia,
        TextWrap,
    ];

    // @ts-ignore
    // @ts-ignore
    public static override defaultConfig: EditorConfig = {
        toolbar: {
            items: [
                'heading',
                '|',
                'bold',
                'italic',
                'underline',
                'strikethrough',
                'link',
                'horizontalLine',
                '|',
                'fontColor',
                'fontBackgroundColor',
                'fontSize',
                'fontFamily',
                '|',
                'bulletedList',
                'numberedList',
                'todoList',
                '|',
                'subscript',
                'superscript',
                'specialCharacters',
                'equations',
                '|',
                'alignment',
                'outdent',
                'indent',
                '|',
                'cb-media',
                'removeFormat',
                'findAndReplace',
                'blockQuote',
                'insertTable',
                'wrapSpan',
                'undo',
                'redo',
            ],
        },
        language: 'en',
        // @ts-ignore
        table: {
            contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableCellProperties', 'tableProperties'],
        },
        htmlSupport: {
            allow: [
                {
                    name: /.*/,
                    attributes: true,
                    classes: true,
                    styles: true,
                },
            ],
        },
        link: {
            addTargetToExternalLinks: true,
            defaultProtocol: 'http://',
        },
        list: {
            properties: {
                styles: true,
                startIndex: true,
                reversed: true,
                bracketed: true,
            },
        },
    };

    constructor(element: HTMLElement, config: EditorConfig) {
        super(element, config);

        this.listenTo(this.editing.view.document, 'clipboardInput', (evt, data) => {
            const clipboardData = data.dataTransfer;
            const pastedHtml = clipboardData.getData('text/html');

            if (pastedHtml) {
                try {
                    const modifiedHtml = this.removeIdAttributes(pastedHtml);

                    this.model.change((writer) => {
                        // Create a fragment from the modified HTML
                        const viewFragment = this.data.processor.toView(modifiedHtml);
                        const modelFragment = this.data.toModel(viewFragment);

                        // Insert the model fragment
                        this.model.insertContent(modelFragment, this.model.document.selection);
                    });

                    // Prevent the default paste behavior since we have handled it
                    evt.stop();
                } catch (error) {
                    console.error('Error handling clipboard input:', error);
                }
            }
        });
    }

    // Util method to remove id attributes from content
    private removeIdAttributes(html: string): string {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        const elementsWithId = tempDiv.querySelectorAll('[id]');
        elementsWithId.forEach((element) => {
            element.removeAttribute('id');
        });

        return tempDiv.innerHTML;
    }
}

export default Editor;

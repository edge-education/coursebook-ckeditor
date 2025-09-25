/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module table/ui/inserttabletemplateview
 */
import { View } from 'ckeditor5/src/ui';
import '../../theme/inserttabletemplate.css';

export default class InsertTableTemplateView extends View {
    constructor(locale) {
        super(locale);

        const bind = this.bindTemplate;

        this.setTemplate({
            tag: 'div',
            attributes: {
                class: ['ck', 'table-template-view'],
            },
            children: [
                {
                    tag: 'h3',
                    children: 'Select a Template',
                },
                {
                    tag: 'div',
                    attributes: {
                        class: ['ck', 'table-template-trigger'],
                    },
                    children: 'Choose from available templates...',
                    on: {
                        click: bind.to(() => {
                            this.fire('openTableTemplateSelection');
                        }),
                    },
                },
            ],
        });

        this.delegate('event:click').to(this);
    }

    render() {
        super.render();
    }
}

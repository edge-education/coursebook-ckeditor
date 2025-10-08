/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module table/ui/inserttabletemplateview
 */
import { View } from 'ckeditor5/src/ui';
import tableIcon from '../../theme/icons/table.svg';
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
                    attributes: {
                        class: ['ck', 'table-template-trigger'],
                    },
                    children: 'Open table templates',
                    on: {
                        click: bind.to(() => {
                            if (window.bus) {
                                window.bus.openTableTemplateSelection().then(template => {
                                    if (template) {
                                        this.fire('openTableTemplateSelection', template);
                                    }
                                });
                            }
                        }),
                    },
                },
            ],
        });

        this.delegate('event:click').to(this);
    }

    render() {
        super.render();

        // Add the table icon to the h3 element
        const h3Element = this.element.querySelector('h3.ck.table-template-trigger');
        if (h3Element) {
            // Create icon element
            const iconElement = document.createElement('span');
            iconElement.classList.add('ck', 'table-template-icon');
            iconElement.innerHTML = tableIcon;

            // Append icon to the right of the text
            h3Element.appendChild(iconElement);
        }
    }
}

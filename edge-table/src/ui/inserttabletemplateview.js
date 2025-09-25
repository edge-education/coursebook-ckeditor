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
                    tag: 'ul',
                    attributes: {
                        class: ['ck', 'table-template-group'],
                    },
                    children: this._getTemplates(),
                },
            ],
        });

        this.delegate('event:click').to(this);
    }

    _getTemplates() {
        const bind = this.bindTemplate;

        // Initialize with loading state if templates aren't cached
        if (!this._templateCache) {
            this._loadTemplatesAsync();
            return [{
                tag: 'li',
                attributes: {
                    class: ['ck', 'table-template-item'],
                },
                children: 'Loading templates...',
            }];
        }

        // Return empty state if no templates are available
        if (this._templateCache.length === 0) {
            return [{
                tag: 'li',
                attributes: {
                    class: ['ck', 'table-template-item', 'table-template-empty'],
                },
                children: 'No templates available',
            }];
        }

        return this._templateCache.map((template) => ({
            tag: 'li',
            attributes: {
                class: ['ck', 'table-template-item'],
                'data-template-id': template.id,
            },
            children: template.name,
            on: {
                click: bind.to(() => {
                    const templateConfig = this._templateCache.find((tableTemplate) => tableTemplate.id === template.id);
                    this.fire('execute-template', templateConfig.html);
                }),
            },
        }));
    }

    async _loadTemplatesAsync() {
        try {
            this._templateCache = await this._templates();
            // Re-render the view with the loaded templates
            this._refreshTemplateList();
        } catch (error) {
            console.error('Failed to load templates:', error);
            this._templateCache = [];
            this._refreshTemplateList();
        }
    }

    _refreshTemplateList() {
        // Find the template list element and update it
        const templateList = this.element?.querySelector('.table-template-group');
        if (templateList) {
            // Clear existing items
            templateList.innerHTML = '';

            // Add new template items
            this._getTemplates().forEach(templateDef => {
                const element = document.createElement(templateDef.tag);

                // Set attributes
                if (templateDef.attributes) {
                    Object.entries(templateDef.attributes).forEach(([key, value]) => {
                        if (Array.isArray(value)) {
                            element.className = value.join(' ');
                        } else {
                            element.setAttribute(key, value);
                        }
                    });
                }

                // Set content
                element.textContent = templateDef.children;

                // Add event listeners
                if (templateDef.on && templateDef.on.click) {
                    element.addEventListener('click', templateDef.on.click);
                }

                templateList.appendChild(element);
            });
        }
    }

    async _templates() {
        if (!this._templateCache) {
            try {
                // Get the current script location to build the template path
                const templateBasePath = this._getTemplateBasePath();

                // Load template registry
                const templatesResponse = await fetch(`${templateBasePath}/templates.json`);

                if (!templatesResponse.ok) {
                    // templates.json doesn't exist or isn't accessible
                    this._templateCache = [];
                    return this._templateCache;
                }

                const templateConfigs = await templatesResponse.json();

                if (!Array.isArray(templateConfigs) || templateConfigs.length === 0) {
                    // templates.json is empty or not an array
                    this._templateCache = [];
                    return this._templateCache;
                }

                // Load HTML content for each template
                this._templateCache = await Promise.all(
                    templateConfigs.map(async (config) => {
                        try {
                            const htmlResponse = await fetch(`${templateBasePath}/${config.filename}`);
                            const html = await htmlResponse.text();
                            return {
                                id: config.id,
                                name: config.name,
                                html: html
                            };
                        } catch (htmlError) {
                            console.warn(`Failed to load template file ${config.filename}:`, htmlError);
                            return {
                                id: config.id,
                                name: config.name,
                                html: ''
                            };
                        }
                    })
                );
            } catch (error) {
                console.warn('Failed to load templates:', error);
                this._templateCache = [];
            }
        }
        return this._templateCache;
    }

    _getTemplateBasePath() {
        // Try to determine the base path for templates
        // This assumes the templates are served from a path relative to the current script
        const currentScript = document.currentScript?.src || window.location.href;
        const scriptDir = currentScript.substring(0, currentScript.lastIndexOf('/'));
        return `${scriptDir}/../templates`;
    }


    render() {
        super.render();
    }
}

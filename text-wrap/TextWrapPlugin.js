import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Command from '@ckeditor/ckeditor5-core/src/command';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import icon from './assets/text-wrap.svg';
import './assets/styles.css';

export default class TextWrap extends Plugin {
    init() {
        const editor = this.editor;

        editor.commands.add('wrapSpan', new SpanCommand(editor));

        editor.ui.componentFactory.add('wrapSpan', (locale) => {
            const view = new ButtonView(locale);
            const command = editor.commands.get('wrapSpan');

            view.set({
                label: 'Wrap together',
                tooltip: true,
                icon: icon,
                isOn: command.value,
            });

            // Bind the button's `isOn` state to the command's `value`
            view.bind('isOn').to(command, 'value');

            view.on('execute', () => {
                editor.execute('wrapSpan');
            });

            return view;
        });

        // Extend schema to allow the wrapClass attribute on a text
        editor.model.schema.extend('$text', { allowAttributes: 'wrapClass' });

        editor.conversion.for('upcast').elementToAttribute({
            view: {
                name: 'span',
                key: 'class',
                classes: 'keep-together',
            },
            model: {
                key: 'wrapClass',
                value: 'keep-together',
            },
        });

        editor.conversion.for('downcast').attributeToElement({
            model: 'wrapClass',
            view: (modelAttributeValue, { writer }) => {
                if (!modelAttributeValue) return null; // No wrapClass, don't create a span

                // Create the span element with the class taken from the model attribute value
                return writer.createAttributeElement('span', { class: modelAttributeValue }, { priority: 1 });
            },
            converterPriority: 'high',
        });
    }
}

class SpanCommand extends Command {
    execute() {
        const editor = this.editor;
        const model = editor.model;
        const selection = model.document.selection;

        model.change((writer) => {
            const ranges = selection.getRanges();

            for (const range of ranges) {
                for (const item of range.getItems()) {
                    if (item.is('textProxy') || item.is('text')) {
                        const itemParent = item.parent;

                        if (item.getAttribute('wrapClass') === 'keep-together') {
                            writer.removeAttribute('wrapClass', item);
                        } else if (
                            itemParent.is('element', 'span') &&
                            itemParent.getAttribute('wrapClass') === 'keep-together'
                        ) {
                            // Skip wrapping if the parent span already has the 'keep-together' class
                        } else {
                            writer.setAttribute('wrapClass', 'keep-together', item);
                        }
                    }
                }
            }
        });
    }

    refresh() {
        const editor = this.editor;
        const model = editor.model;
        const selection = model.document.selection;

        // Enable the command only if the wrapClass attribute can be applied to the selection
        this.isEnabled = model.schema.checkAttributeInSelection(selection, 'wrapClass');

        if (selection.hasAttribute('wrapClass')) {
            this.value = true;
        } else {
            // Check if any part of the selection has the wrapClass attribute applied
            const selectedRanges = selection.getRanges();
            let hasSpanClass = false;

            for (const range of selectedRanges) {
                for (const item of range.getItems()) {
                    if (item.is('textProxy') || item.is('text')) {
                        const spanParent = item.parent;
                        if (
                            spanParent.is('element', 'span') &&
                            spanParent.hasAttribute('wrapClass') &&
                            spanParent.getAttribute('wrapClass') === 'keep-together'
                        ) {
                            hasSpanClass = true;
                            break;
                        }
                    }
                }

                if (hasSpanClass) break;
            }

            this.value = hasSpanClass; // Button active state reflects wrap presence
        }
    }
}

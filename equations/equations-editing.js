import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';
import EquationsCommand from './equations-command';

export default class EquationsEditing extends Plugin {
    init() {
        this._defineSchema();
        this._defineConverters();

        this.editor.commands.add('math', new EquationsCommand(this.editor));
    }

    _defineSchema() {
        const schema = this.editor.model.schema;

        schema.register('math', {
            inheritAllFrom: '$inlineObject',

            allowAttributes: ['val', 'read-only'],
        });
    }

    _defineConverters() {
        const conversion = this.editor.conversion;

        conversion.for('upcast').elementToElement({
            view: {
                name: 'math-field',
                classes: ['math'],
            },
            model: (viewElement, { writer: modelWriter }) => {
                const val = viewElement.getChild(0).data.slice(1, -1);

                return modelWriter.createElement('math', { val });
            },
        });

        conversion.for('editingDowncast').elementToElement({
            model: 'math',
            view: (modelItem, { writer: viewWriter }) => {
                const widgetElement = createMathLiveView(modelItem, viewWriter);

                return toWidget(widgetElement, viewWriter);
            },
        });

        conversion.for('dataDowncast').elementToElement({
            model: 'math',
            view: (modelItem, { writer: viewWriter }) => createMathLiveView(modelItem, viewWriter),
        });

        function createMathLiveView(modelItem, viewWriter) {
            const val = modelItem.getAttribute('val');

            // wrap it in a div to avoid click interceptions
            const div = viewWriter.createContainerElement('span', {
                class: 'simple-box-description',
                style: 'display:inline-block',
            });

            const placeholderView = viewWriter.createContainerElement('math-field', {
                class: 'math',
                'read-only': true,
                'keypress-sound': null,
                'plonk-sound': null,
            });

            const innerText = viewWriter.createText('{' + val + '}');
            viewWriter.insert(viewWriter.createPositionAt(placeholderView, 0), innerText);
            viewWriter.insert(viewWriter.createPositionAt(div, 0), placeholderView);

            return div;
        }
    }
}

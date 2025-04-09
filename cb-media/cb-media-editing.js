import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import CbMediaCommand from './cb-media-command';
import { toWidget } from 'ckeditor5/src/widget';

export default class CbMediaEditing extends Plugin {
    init() {
        this._defineSchema();
        this._defineConverters();

        this.editor.commands.add('cb-media', new CbMediaCommand(this.editor));
    }

    _defineSchema() {
        const schema = this.editor.model.schema;

        schema.register('cbMedia', {
            inheritAllFrom: '$blockObject',
            allowAttributes: ['src', 'caption', 'source'],
        });
    }

    _defineConverters() {
        const conversion = this.editor.conversion;

        conversion.for('editingDowncast').elementToElement({
            model: 'cbMedia',
            view: (modelItem, { writer: viewWriter }) =>
                toWidget(createImageViewElement(modelItem, viewWriter), viewWriter),
        });

        conversion.for('dataDowncast').elementToElement({
            model: 'cbMedia',
            view: (modelItem, { writer: viewWriter }) => createImageViewElement(modelItem, viewWriter),
        });

        conversion.for('upcast').elementToElement({
            view: {
                name: 'figure',
                classes: 'image',
            },
            model: (viewElement, { writer: modelWriter }) => {
                const imgElement = viewElement.getChild(0);
                if (!imgElement || !imgElement.is('element', 'img')) return null;

                const src = imgElement.getAttribute('src');
                const captions = Array.from(viewElement.getChildren())
                    .filter((child) => child.is('element', 'figcaption') && child.hasClass('caption'))
                    .map((captionEl) => captionEl?.getChild(0)?.data || '');

                return modelWriter.createElement('cbMedia', {
                    src,
                    source: captions[0] || '',
                    caption: captions[1] || '',
                });
            },
        });

        const createImageViewElement = (modelItem, writer) => {
            const src = modelItem.getAttribute('src');
            const source = modelItem.getAttribute('source');
            const caption = modelItem.getAttribute('caption');

            const figure = writer.createContainerElement('figure', {
                class: 'image',
                contenteditable: 'false',
                draggable: 'false',
            });

            const image = writer.createEmptyElement('img', {
                src,
                contenteditable: 'false',
                draggable: 'false',
            });
            writer.insert(writer.createPositionAt(figure, 0), image);

            let index = 1;

            if (source && source.length) {
                const figSource = writer.createContainerElement(
                    'figcaption',
                    {
                        class: 'caption',
                        contenteditable: 'false',
                        draggable: 'false',
                    },
                    writer.createText(source)
                );

                writer.insert(writer.createPositionAt(figure, index), figSource);
                index++;
            }

            if (caption && caption.length) {
                const figCaption = writer.createContainerElement(
                    'figcaption',
                    {
                        class: 'caption',
                        contenteditable: 'false',
                        draggable: 'false',
                    },
                    writer.createText(caption)
                );

                writer.insert(writer.createPositionAt(figure, index), figCaption);
            }

            writer.setCustomProperty('cbMedia', true, figure);

            return figure;
        };
    }
}

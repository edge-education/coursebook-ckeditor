/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import { global } from 'ckeditor5/src/utils';
import { COLUMN_WIDTH_PRECISION, COLUMN_MIN_WIDTH_AS_PERCENTAGE, COLUMN_MIN_WIDTH_IN_PIXELS } from './constants';
/**
 * Returns all the inserted or changed table model elements in a given change set. Only the tables
 * with 'columnsWidth' attribute are taken into account. The returned set may be empty.
 *
 * Most notably if an entire table is removed it will not be included in returned set.
 *
 * @param model The model to collect the affected elements from.
 * @returns A set of table model elements.
 */
export function getChangedResizedTables(model) {
    const affectedTables = new Set();
    for (const change of model.document.differ.getChanges()) {
        let referencePosition = null;
        // Checks if the particular change from the differ is:
        // - an insertion or removal of a table, a row or a cell,
        // - an attribute change on a table, a row or a cell.
        switch (change.type) {
            case 'insert':
                referencePosition = ['table', 'tableRow', 'tableCell'].includes(change.name) ? change.position : null;
                break;
            case 'remove':
                // If the whole table is removed, there's no need to update its column widths (#12201).
                referencePosition = ['tableRow', 'tableCell'].includes(change.name) ? change.position : null;
                break;
            case 'attribute':
                if (change.range.start.nodeAfter) {
                    referencePosition = ['table', 'tableRow', 'tableCell'].includes(change.range.start.nodeAfter.name)
                        ? change.range.start
                        : null;
                }
                break;
        }
        if (!referencePosition) {
            continue;
        }
        const tableNode =
            referencePosition.nodeAfter && referencePosition.nodeAfter.is('element', 'table')
                ? referencePosition.nodeAfter
                : referencePosition.findAncestor('table');
        // We iterate over the whole table looking for the nested tables that are also affected.
        for (const node of model.createRangeOn(tableNode).getItems()) {
            if (!node.is('element', 'table')) {
                continue;
            }
            if (!getColumnGroupElement(node)) {
                continue;
            }
            affectedTables.add(node);
        }
    }
    return affectedTables;
}
/**
 * Calculates the percentage of the minimum column width given in pixels for a given table.
 *
 * @param modelTable A table model element.
 * @param editor The editor instance.
 * @returns The minimal column width in percentage.
 */
export function getColumnMinWidthAsPercentage(modelTable, editor) {
    return (COLUMN_MIN_WIDTH_IN_PIXELS * 100) / getTableWidthInPixels(modelTable, editor);
}
/**
 * Calculates the table width in pixels.
 *
 * @param modelTable A table model element.
 * @param editor The editor instance.
 * @returns The width of the table in pixels.
 */
export function getTableWidthInPixels(modelTable, editor) {
    // It is possible for a table to not have a <tbody> element - see #11878.
    const referenceElement =
        getChildrenViewElement(modelTable, 'tbody', editor) || getChildrenViewElement(modelTable, 'thead', editor);
    const domReferenceElement = editor.editing.view.domConverter.mapViewToDom(referenceElement);
    return getElementWidthInPixels(domReferenceElement);
}
/**
 * Returns the a view element with a given name that is nested directly in a `<table>` element
 * related to a given `modelTable`.
 *
 * @param elementName Name of a view to be looked for, e.g. `'colgroup`', `'thead`'.
 * @returns Matched view or `undefined` otherwise.
 */
function getChildrenViewElement(modelTable, elementName, editor) {
    const viewFigure = editor.editing.mapper.toViewElement(modelTable);
    const viewTable = [...viewFigure.getChildren()].find((node) => node.is('element', 'table'));
    return [...viewTable.getChildren()].find((node) => node.is('element', elementName));
}
/**
 * Returns the computed width (in pixels) of the DOM element without padding and borders.
 *
 * @param domElement A DOM element.
 * @returns The width of the DOM element in pixels.
 */
export function getElementWidthInPixels(domElement) {
    const styles = global.window.getComputedStyle(domElement);
    // In the 'border-box' box sizing algorithm, the element's width
    // already includes the padding and border width (#12335).
    if (styles.boxSizing === 'border-box') {
        return (
            parseFloat(styles.width) -
            parseFloat(styles.paddingLeft) -
            parseFloat(styles.paddingRight) -
            parseFloat(styles.borderLeftWidth) -
            parseFloat(styles.borderRightWidth)
        );
    } else {
        return parseFloat(styles.width);
    }
}

export function getElementWidthInMillimeters(elementWidthInPx) {
    const elementWidth = parseFloat(elementWidthInPx);
    const pixelToMM = parseFloat((25.4 / 96).toFixed(7));
    const resultInMM = pixelToMM * elementWidth;

    return Math.round(resultInMM);
}

/**
 * Returns the column indexes on the left and right edges of a cell. They differ if the cell spans
 * across multiple columns.
 *
 * @param cell A table cell model element.
 * @param tableUtils The Table Utils plugin instance.
 * @returns An object containing the indexes of the left and right edges of the cell.
 */
export function getColumnEdgesIndexes(cell, tableUtils) {
    const cellColumnIndex = tableUtils.getCellLocation(cell).column;
    const cellWidth = cell.getAttribute('colspan') || 1;
    return {
        leftEdge: cellColumnIndex,
        rightEdge: cellColumnIndex + cellWidth - 1,
    };
}
/**
 * Rounds the provided value to a fixed-point number with defined number of digits after the decimal point.
 *
 * @param value A number to be rounded.
 * @returns The rounded number.
 */
export function toPrecision(value) {
    const multiplier = Math.pow(10, COLUMN_WIDTH_PRECISION);
    const number = typeof value === 'number' ? value : parseFloat(value);
    return Math.round(number * multiplier) / multiplier;
}
/**
 * Clamps the number within the inclusive lower (min) and upper (max) bounds. Returned number is rounded using the
 * {@link ~toPrecision `toPrecision()`} function.
 *
 * @param number A number to be clamped.
 * @param min A lower bound.
 * @param max An upper bound.
 * @returns The clamped number.
 */
export function clamp(number, min, max) {
    if (number <= min) {
        return toPrecision(min);
    }
    if (number >= max) {
        return toPrecision(max);
    }
    return toPrecision(number);
}
/**
 * Creates an array with defined length and fills all elements with defined value.
 *
 * @param length The length of the array.
 * @param value The value to fill the array with.
 * @returns An array with defined length and filled with defined value.
 */
export function createFilledArray(length, value) {
    return Array(length).fill(value);
}
/**
 * Sums all array values that can be parsed to a float.
 *
 * @param array An array of numbers.
 * @returns The sum of all array values.
 */
export function sumArray(array) {
    return array
        .map((value) => (typeof value === 'number' ? value : parseFloat(value)))
        .filter((value) => !Number.isNaN(value))
        .reduce((result, item) => result + item, 0);
}
/**
 * Makes sure that the sum of the widths from all columns is 100%. If the sum of all the widths is not equal 100%, all the widths are
 * changed proportionally so that they all sum back to 100%. If there are columns without specified width, the amount remaining
 * after assigning the known widths will be distributed equally between them.
 *
 * Currently, only widths provided as percentage values are supported.
 *
 * @param columnWidths An array of column widths.
 * @returns An array of column widths guaranteed to sum up to 100%.
 */
export function normalizeColumnWidths(columnWidths) {
    const widths = columnWidths.map((width) => {
        // Possible values are 'auto' or string ending with '%'
        if (width === 'auto') {
            return width;
        }
        return parseFloat(width.replace('%', ''));
    });
    let normalizedWidths = calculateMissingColumnWidths(widths);
    const totalWidth = sumArray(normalizedWidths);
    if (totalWidth !== 100) {
        normalizedWidths = normalizedWidths
            // Adjust all the columns proportionally.
            .map((width) => toPrecision((width * 100) / totalWidth))
            // Due to rounding of numbers it may happen that the sum of the widths of all columns will not be exactly 100%.
            // Therefore, the width of the last column is explicitly adjusted (narrowed or expanded), since all the columns
            // have been proportionally changed already.
            .map((columnWidth, columnIndex, width) => {
                const isLastColumn = columnIndex === width.length - 1;
                if (!isLastColumn) {
                    return columnWidth;
                }
                const totalWidth = sumArray(width);
                return toPrecision(columnWidth + 100 - totalWidth);
            });
    }
    return normalizedWidths.map((width) => width + '%');
}
/**
 * Initializes the column widths by parsing the attribute value and calculating the uninitialized column widths. The special value 'auto'
 * indicates that width for the column must be calculated. The width of such uninitialized column is calculated as follows:
 * - If there is enough free space in the table for all uninitialized columns to have at least the minimum allowed width for all of them,
 *   then set this width equally for all uninitialized columns.
 * - Otherwise, just set the minimum allowed width for all uninitialized columns. The sum of all column widths will be greater than 100%,
 *   but then it will be adjusted proportionally to 100% in {@link #normalizeColumnWidths `normalizeColumnWidths()`}.
 *
 * @param columnWidths An array of column widths.
 * @returns An array with 'auto' values replaced with calculated widths.
 */
function calculateMissingColumnWidths(columnWidths) {
    const numberOfUninitializedColumns = columnWidths.filter((columnWidth) => columnWidth === 'auto').length;
    if (numberOfUninitializedColumns === 0) {
        return columnWidths.map((columnWidth) => toPrecision(columnWidth));
    }
    const totalWidthOfInitializedColumns = sumArray(columnWidths);
    const widthForUninitializedColumn = Math.max(
        (100 - totalWidthOfInitializedColumns) / numberOfUninitializedColumns,
        COLUMN_MIN_WIDTH_AS_PERCENTAGE
    );
    return columnWidths
        .map((columnWidth) => (columnWidth === 'auto' ? widthForUninitializedColumn : columnWidth))
        .map((columnWidth) => toPrecision(columnWidth));
}
/**
 * Calculates the total horizontal space taken by the cell. That includes:
 *  * width,
 *  * left and red padding,
 *  * border width.
 *
 * @param domCell A DOM cell element.
 * @returns Width in pixels without `px` at the end.
 */
export function getDomCellOuterWidth(domCell) {
    const styles = global.window.getComputedStyle(domCell);
    // In the 'border-box' box sizing algorithm, the element's width
    // already includes the padding and border width (#12335).
    if (styles.boxSizing === 'border-box') {
        return parseInt(styles.width);
    } else {
        return (
            parseFloat(styles.width) +
            parseFloat(styles.paddingLeft) +
            parseFloat(styles.paddingRight) +
            parseFloat(styles.borderWidth)
        );
    }
}
/**
 * Updates column elements to match columns widths.
 *
 * @param columns
 * @param tableColumnGroup
 * @param normalizedWidths
 * @param writer
 */
export function updateColumnElements(columns, tableColumnGroup, normalizedWidths, writer) {
    for (let i = 0; i < Math.max(normalizedWidths.length, columns.length); i++) {
        const column = columns[i];
        const columnWidth = normalizedWidths[i];
        if (!columnWidth) {
            // Number of `<tableColumn>` elements exceeds actual number of columns.
            writer.remove(column);
        } else if (!column) {
            // There is fewer `<tableColumn>` elements than actual columns.
            writer.appendElement('tableColumn', { columnWidth }, tableColumnGroup);
        } else {
            // Update column width.
            writer.setAttribute('columnWidth', columnWidth, column);
        }
    }
}
/**
 * Returns a 'tableColumnGroup' element from the 'table'.
 *
 * @internal
 * @param element A 'table' or 'tableColumnGroup' element.
 * @returns A 'tableColumnGroup' element.
 */
export function getColumnGroupElement(element) {
    if (element.is('element', 'tableColumnGroup')) {
        return element;
    }
    const children = element.getChildren();
    return Array.from(children).find((element) => element.is('element', 'tableColumnGroup'));
}
/**
 * Returns an array of 'tableColumn' elements.
 *
 * @internal
 * @param element A 'table' or 'tableColumnGroup' element.
 * @returns An array of 'tableColumn' elements.
 */
export function getTableColumnElements(element) {
    return Array.from(getColumnGroupElement(element).getChildren());
}
/**
 * Returns an array of table column widths.
 *
 * @internal
 * @param element A 'table' or 'tableColumnGroup' element.
 * @returns An array of table column widths.
 */
export function getTableColumnsWidths(element) {
    return getTableColumnElements(element).map((column) => column.getAttribute('columnWidth'));
}

/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module table/utils/table-properties
 */
import type { BoxSides } from 'ckeditor5/src/engine';

/**
 * Returns a string if all four values of box sides are equal.
 *
 * If a string is passed, it is treated as a single value (pass-through).
 *
 * ```ts
 * // Returns 'foo':
 * getSingleValue( { top: 'foo', right: 'foo', bottom: 'foo', left: 'foo' } );
 * getSingleValue( 'foo' );
 *
 * // Returns undefined:
 * getSingleValue( { top: 'foo', right: 'foo', bottom: 'bar', left: 'foo' } );
 * getSingleValue( { top: 'foo', right: 'foo' } );
 * ```
 */
export declare function getSingleValue(objectOrString: BoxSides | string | undefined): string | undefined;

/**
 * Adds a unit to a value if the value is a number or a string representing a number.
 *
 * **Note**: It does nothing to non-numeric values.
 *
 * ```ts
 * getSingleValue( 25, 'px' ); // '25px'
 * getSingleValue( 25, 'em' ); // '25em'
 * getSingleValue( '25em', 'px' ); // '25em'
 * getSingleValue( 'foo', 'px' ); // 'foo'
 * ```
 *
 * @param defaultUnit A default unit added to a numeric value.
 */
export declare function addDefaultUnitToNumericValue(
    value: string | number | undefined,
    defaultUnit: string
): string | number | undefined;

export interface NormalizedDefaultProperties {
    borderStyle: string;
    borderWidth: string;
    borderColor: string;

    borderTopStyle: string;
    borderTopColor: string;
    borderTopWidth: string;

    borderRightStyle: string;
    borderRightColor: string;
    borderRightWidth: string;

    borderBottomStyle: string;
    borderBottomColor: string;
    borderBottomWidth: string;

    borderLeftStyle: string;
    borderLeftColor: string;
    borderLeftWidth: string;

    backgroundColor: string;
    width: string;
    height: string;
    alignment?: string;
    padding?: string;
    verticalAlignment?: string;
    horizontalAlignment?: string;
}

/**
 * Returns the normalized configuration.
 *
 * @param options.includeAlignmentProperty Whether the "alignment" property should be added.
 * @param options.includePaddingProperty Whether the "padding" property should be added.
 * @param options.includeVerticalAlignmentProperty Whether the "verticalAlignment" property should be added.
 * @param options.includeHorizontalAlignmentProperty Whether the "horizontalAlignment" property should be added.
 * @param options.isRightToLeftContent Whether the content is right-to-left.
 */
export declare function getNormalizedDefaultProperties(
    config: Partial<NormalizedDefaultProperties> | undefined,
    options?: {
        includeAlignmentProperty?: boolean;
        includePaddingProperty?: boolean;
        includeVerticalAlignmentProperty?: boolean;
        includeHorizontalAlignmentProperty?: boolean;
        isRightToLeftContent?: boolean;
    }
): NormalizedDefaultProperties;

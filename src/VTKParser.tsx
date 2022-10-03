import { BufferGeometry, Float32BufferAttribute } from "three";

export class VTKParser {
    public static parse (data:string) {
        let geometry : BufferGeometry = new BufferGeometry();
        return VTKParser.parseASCII(data,geometry);
    }

    public static parseASCII(data: string, geometry: BufferGeometry) {
		// connectivity of the triangles
		var indices = [];

		// triangles vertices
		var positions = [];

		// red, green, blue colors in the range 0 to 1
		var colors = [];

		// normal vector, one per vertex
		var normals = [];

		var result;

		// pattern for detecting the end of a number sequence
		var patWord = /^[^\d.\s-]+/;

		// pattern for reading vertices, 3 floats or integers
		var pat3Floats = /(\-?\d+\.?[\d\-\+e]*)\s+(\-?\d+\.?[\d\-\+e]*)\s+(\-?\d+\.?[\d\-\+e]*)/g;

		// pattern for connectivity, an integer followed by any number of ints
		// the first integer is the number of polygon nodes
		var patConnectivity = /^(\d+)\s+([\s\d]*)/;

		// indicates start of vertex data section
		var patPOINTS = /^POINTS /;

		// indicates start of polygon connectivity section
		var patPOLYGONS = /^POLYGONS /;

		// indicates start of triangle strips section
		var patTRIANGLE_STRIPS = /^TRIANGLE_STRIPS /;

		// POINT_DATA number_of_values
		var patPOINT_DATA = /^POINT_DATA[ ]+(\d+)/;

		// CELL_DATA number_of_polys
		var patCELL_DATA = /^CELL_DATA[ ]+(\d+)/;

		// Start of color section
		var patCOLOR_SCALARS = /^COLOR_SCALARS[ ]+(\w+)[ ]+3/;

		// NORMALS Normals float
		var patNORMALS = /^NORMALS[ ]+(\w+)[ ]+(\w+)/;

		var inPointsSection = false;
		var inPolygonsSection = false;
		var inTriangleStripSection = false;
		var inPointDataSection = false;
		var inCellDataSection = false;
		var inColorSection = false;
		var inNormalsSection = false;

		var lines = data.split( '\n' );

		for ( var i in lines ) {

			var line = lines[ i ].trim();

			if ( line.indexOf( 'DATASET' ) === 0 ) {

				var dataset = line.split( ' ' )[ 1 ];

				if ( dataset !== 'POLYDATA' ) throw new Error( 'Unsupported DATASET type: ' + dataset );

			} else if ( inPointsSection ) {

				// get the vertices
				while ( ( result = pat3Floats.exec( line ) ) !== null ) {

					if ( patWord.exec( line ) !== null ) break;

					var x = parseFloat( result[ 1 ] );
					var y = parseFloat( result[ 2 ] );
					var z = parseFloat( result[ 3 ] );
					positions.push( x, y, z );

				}

			} else if ( inPolygonsSection ) {

				if ( ( result = patConnectivity.exec( line ) ) !== null ) {

					// numVertices i0 i1 i2 ...
					var numVertices = parseInt( result[ 1 ] );
					var inds = result[ 2 ].split( /\s+/ );

					if ( numVertices >= 3 ) {

						var i0 = parseInt( inds[ 0 ] );
						var i1, i2;
						var k = 1;
						// split the polygon in numVertices - 2 triangles
						for ( var j = 0; j < numVertices - 2; ++ j ) {

							i1 = parseInt( inds[ k ] );
							i2 = parseInt( inds[ k + 1 ] );
							indices.push( i0, i1, i2 );
							k ++;

						}

					}

				}

			} else if ( inTriangleStripSection ) {

				if ( ( result = patConnectivity.exec( line ) ) !== null ) {

					// numVertices i0 i1 i2 ...
					var numVertices = parseInt( result[ 1 ] );
					var inds = result[ 2 ].split( /\s+/ );

					if ( numVertices >= 3 ) {

						var i0 : number, i1, i2;
						// split the polygon in numVertices - 2 triangles
						for ( var j = 0; j < numVertices - 2; j ++ ) {

							if ( j % 2 === 1 ) {

								i0 = parseInt( inds[ j ] );
								i1 = parseInt( inds[ j + 2 ] );
								i2 = parseInt( inds[ j + 1 ] );
								indices.push( i0, i1, i2 );

							} else {

								i0 = parseInt( inds[ j ] );
								i1 = parseInt( inds[ j + 1 ] );
								i2 = parseInt( inds[ j + 2 ] );
								indices.push( i0, i1, i2 );

							}

						}

					}

				}

			} else if ( inPointDataSection || inCellDataSection ) {

				if ( inColorSection ) {

					// Get the colors

					while ( ( result = pat3Floats.exec( line ) ) !== null ) {

						if ( patWord.exec( line ) !== null ) break;

						var r = parseFloat( result[ 1 ] );
						var g = parseFloat( result[ 2 ] );
						var b = parseFloat( result[ 3 ] );
						colors.push( r, g, b );

					}

				} else if ( inNormalsSection ) {

					// Get the normal vectors

					while ( ( result = pat3Floats.exec( line ) ) !== null ) {

						if ( patWord.exec( line ) !== null ) break;

						var nx = parseFloat( result[ 1 ] );
						var ny = parseFloat( result[ 2 ] );
						var nz = parseFloat( result[ 3 ] );
						normals.push( nx, ny, nz );

					}

				}

			}

			if ( patPOLYGONS.exec( line ) !== null ) {

				inPolygonsSection = true;
				inPointsSection = false;
				inTriangleStripSection = false;

			} else if ( patPOINTS.exec( line ) !== null ) {

				inPolygonsSection = false;
				inPointsSection = true;
				inTriangleStripSection = false;

			} else if ( patTRIANGLE_STRIPS.exec( line ) !== null ) {

				inPolygonsSection = false;
				inPointsSection = false;
				inTriangleStripSection = true;

			} else if ( patPOINT_DATA.exec( line ) !== null ) {

				inPointDataSection = true;
				inPointsSection = false;
				inPolygonsSection = false;
				inTriangleStripSection = false;

			} else if ( patCELL_DATA.exec( line ) !== null ) {

				inCellDataSection = true;
				inPointsSection = false;
				inPolygonsSection = false;
				inTriangleStripSection = false;

			} else if ( patCOLOR_SCALARS.exec( line ) !== null ) {

				inColorSection = true;
				inNormalsSection = false;
				inPointsSection = false;
				inPolygonsSection = false;
				inTriangleStripSection = false;

			} else if ( patNORMALS.exec( line ) !== null ) {

				inNormalsSection = true;
				inColorSection = false;
				inPointsSection = false;
				inPolygonsSection = false;
				inTriangleStripSection = false;

			}

		}
		
		//return [indices, positions, normals, colors];
		//console.log("HACK", indices, positions, normals, colors);
		//var f32b = @org.diskproject.client.components.brain.VTKParser::createFloat32([FI);

		//var geometry = new THREE.BufferGeometry();
		geometry.setIndex( indices );
		//geometry.addAttribute( 'position', VTKParser.f32b( positions, 3 ) );
		geometry.setAttribute( 'position', VTKParser.f32b( positions, 3 ) )

		if ( normals.length === positions.length ) {

			//geometry.addAttribute( 'normal', VTKParser.f32b( normals, 3 ) );
			geometry.setAttribute( 'normal', VTKParser.f32b( normals, 3 ) );

		}

		if ( colors.length !== indices.length ) {

			// stagger

			if ( colors.length === positions.length ) {

				//geometry.addAttribute( 'color', VTKParser.f32b( colors, 3 ) );
				console.log("A");
				geometry.setAttribute( 'color', VTKParser.f32b( colors, 3 ) );

			}

		} else {

			// cell

			geometry = geometry.toNonIndexed();
			var numTriangles = geometry.attributes.position.count / 3;

			if ( colors.length === ( numTriangles * 3 ) ) {

				var newColors = [];

				for ( var ii = 0; ii < numTriangles; ii ++ ) {

					var r = colors[ 3 * ii + 0 ];
					var g = colors[ 3 * ii + 1 ];
					var b = colors[ 3 * ii + 2 ];

					newColors.push( r, g, b );
					newColors.push( r, g, b );
					newColors.push( r, g, b );

				}

				//geometry.addAttribute( 'color', VTKParser.f32b( newColors, 3 ) );
				console.log("B");
				geometry.setAttribute( 'color', VTKParser.f32b( newColors, 3 ) );
			}

		}

		return geometry;
    }

    private static f32b (arr:number[] , i:number) {
		return new Float32BufferAttribute(arr, i);
	}

}


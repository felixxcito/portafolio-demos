/**
 * Canal entre la paleta de comandos y el tablero.
 *
 * La paleta vive en la cabecera y el tablero en el cuerpo de la página: no
 * comparten ancestro que pueda sostener el estado sin subirlo a toda la
 * ruta. Un evento del documento los comunica con dos líneas, sin proveedor
 * y —lo importante— sin navegar, que es lo que borraría los datos que el
 * visitante acaba de subir.
 */
export const EVENTO_FILTRO = "cifra:filtro";

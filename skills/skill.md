---
name: music-blog-posting
description: Instrucciones y directrices para publicar contenido, dar formato a los embeds y corregir tildes y gramática en el blog.
---

# Guía para Publicar en el Blog de Música (Music Blog Posting Skill)

Esta guía explica detalladamente cómo estructurar, formatear, corregir la ortografía y crear nuevos posts en este blog. Cualquier modelo de IA que trabaje en este repositorio en el futuro debe leer y aplicar estas reglas estrictamente.

## 1. Estructura de los Archivos de Post

Los posts se almacenan en formato JSON dentro de la carpeta `src/content/posts/[año]/` bajo el nombre `[DD-MM-YYYY].json` (por ejemplo, `08-07-2026.json`).

### Esquema y Campos del JSON

Cada archivo debe contener un objeto JSON con los siguientes campos:

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | Un identificador único generado con UUIDv4. |
| `publishDate` | `number` | La fecha y hora de publicación en formato de milisegundos (timestamp). |
| `title` | `string` | Un título descriptivo corto, un fragmento de letra o una frase de sentimiento. |
| `content` | `string` | El texto del post. Se deben usar etiquetas HTML como `<br>` o `<br><br>` para estructurar saltos de línea y párrafos. Los enlaces deben estructurarse como `<a href="..." target="_blank">...</a>`. |
| `likes` | `number` | El contador de likes inicial (por defecto inicia en `1`). |
| `publisher` | `string` | Siempre se debe configurar como `"j-oyola-baby-la-maravilla"`. |
| `spotifyUrl` | `string` (opcional) | El enlace de inserción (embed) de Spotify si se incluye una canción. Formato: `https://open.spotify.com/embed/track/[TRACK_ID]?utm_source=generator`. |
| `valor` | `boolean` (opcional) | Configurar en `true` para destacar el post y enviarlo a la página de "Mis pensamientos más sabios" (`/destacados`). |

### Ejemplo del Archivo JSON

```json
{
    "id": "ae63b91b-069b-425f-87df-fd9a84fe3f64",
    "publishDate": 1783522547807,
    "title": "Hacía mucho tiempo",
    "content": "Hola, hacía mucho tiempo que no posteaba. Sabes, me pasó algo curioso...<br><br>Tqm q lector </3",
    "likes": 1,
    "publisher": "j-oyola-baby-la-maravilla",
    "spotifyUrl": "https://open.spotify.com/embed/track/07DUeK6z4knyXHhEjjkjid?utm_source=generator"
}
```

---

## 2. Flujo Técnico para Nuevas Publicaciones

1. **Generación de ID y Timestamp:**
   Utiliza Node.js para obtener el UUID y la fecha actual en milisegundos de forma limpia:
   ```bash
   node -e "console.log(JSON.stringify({id: crypto.randomUUID(), timestamp: Date.now()}))"
   ```
2. **Creación del Archivo:**
   Guarda el JSON con la codificación adecuada en `src/content/posts/[año-actual]/[DD-MM-YYYY].json`.
3. **Commit Local:**
   Verifica los cambios con `git diff` y confírmalos localmente.

---

## 3. Reglas de Gramática, Redacción y Ortografía en Español

La IA debe analizar el borrador del post y aplicar correcciones ortográficas y de puntuación manteniendo el tono íntimo y la voz natural del autor.

### Reglas Críticas de Acentuación (Tildes):
* **Verbos en Pretérito Imperfecto y Condicional:** Terminan con tilde en la vocal "í" (ej. *hacía*, *aconsejaría*, *quería*).
* **Verbos en Futuro:** Llevan tilde en la última sílaba (ej. *volverá*, *cambiaré*, *encargará*, *sentirá*).
* **Verbo "Estar" (Presente):** Escribir *está* con tilde cuando sea verbo conjugado (ej. *"la otra persona está apenas entrando"*), para diferenciarlo del demostrativo *esta*.
* **Afirmación:** Escribir *sí* con tilde cuando sea una afirmación (ej. *"Pero sí, he hecho..."*), para diferenciarlo del condicional *si*.
* **Diferenciación de "más" / "mas":** Usar *más* con tilde cuando denote cantidad (ej. *"un dominio más normalito"*), y *mas* sin tilde solo si actúa como conjunción equivalente a *pero*.
* **Pronombres y Adverbios Interrogativos/Exclamativos:** Usar *cómo* y *qué* con tilde en preguntas o exclamaciones indirectas (ej. *"ver cómo otra persona"*, *"no sé qué hacer"*).
* **Palabras Clave Recurrentes:**
  * *ahí* (lugar) siempre con tilde.
  * *también* siempre con tilde.
  * *empatía* siempre con tilde.
  * *viviéndolo* (esdrújula) siempre con tilde.

### Reglas de Puntuación:
* **Vocativos:** Separar los vocativos mediante comas (ej. *"Sabes, me pasó algo curioso"*).
* **Conjunción "Pero":** Anteponer siempre una coma antes de introducir la palabra "pero" si divide dos oraciones (ej. *"Escribir te hace olvidar, pero solo temporalmente"*).

### Preservación del Tono del Autor:
* **El término "super":** Se prefiere conservar como **super** sin tilde (ej. *super largo*, *super bonito*) para mantener la esencia del lenguaje del autor en el blog, excepto si el usuario explícitamente pide corregirlo a *súper*.

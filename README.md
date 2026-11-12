# Sorteo del concurso del club 2026-2027

Cuatro ruletas, una por categoría, para sortear el orden de participación.

```bash
npm run dev      # abre la pantalla del sorteo
```

- Cada giro sortea el siguiente lugar y saca a esa persona de la ruleta. El último lugar se asigna solo.
- El resultado se guarda en el navegador: recargar no lo borra.
- «Copiar resultados» deja el orden de las cuatro categorías listo para pegar en WhatsApp.
- Los concursantes se editan en `src/concursantes.js`.
- Espacio o Enter giran la ruleta y cierran el anuncio.

Publicado en https://vmanuelsm.github.io/sorteo-concurso-club-2026/ — `./deploy.sh` compila y vuelve a publicar.

Las fotos de los concursantes van en `public/fotos/<slug>.jpg`; si falta alguna, se muestran las iniciales.

# Módulo Galeria ("Momentos que ficam") — Especificação

> Anotações da visão do Gustavo (sessão 2026-07-10). **Ainda NÃO implementado.**
> Relacionado: [[CLAUDE.md]]. Módulo simples: **vitrine de imagens controlada pelo admin**.

---

## 1. Visão
A seção **"Momentos que ficam" / "História em imagens"** é uma **vitrine de fotos**. O admin
gerencia as imagens e suas legendas pelo painel, e a **legenda aparece automaticamente** na vitrine.

## 2. Estado atual
- Seção existe: [Gallery.tsx](../frontend/src/components/Gallery.tsx), dados estáticos em
  [data/gallery.ts](../frontend/src/data/gallery.ts).
- Grid tipo mosaico com tamanhos variados (`large | medium | small`).
- Legenda (evento, ano, categoria) hoje aparece **só no hover** (`opacity-0 group-hover:opacity-100`).
- Modelo estático: `GalleryPhoto = { id, src, event, year, category, size }`.

## 3. Requisitos (o que o Gustavo pediu)
1. **É vitrine só** (sem clique/modal — diferente da vitrine de clubes).
2. **Legenda aparece automaticamente** — não depender de hover pra ver a legenda. (Confirmar
   comportamento visual: sempre visível vs. algum outro; a intenção é "não ficar escondida").
3. **Controlada pelo painel admin** — CRUD de fotos: subir imagem + preencher legenda
   (evento, ano, categoria) + escolher tamanho/destaque no mosaico.

## 4. Modelagem proposta — `FotoGaleria`
- `id`, `imagemUrl` (upload — ver nota R2), `evento`, `ano`, `categoria`
- `tamanho` (large | medium | small — posição no mosaico), `ordem`
- timestamps

## 5. Endpoints
- Público: `GET /api/galeria`
- Admin: `POST` / `PUT /{id}` / `DELETE /{id}` + upload de imagem

## 6. Decisões / notas
- [ ] Legenda **sempre visível** ou manter o hover mais suave? (o pedido é "aparecer automaticamente").
- [ ] Categorias/eventos: texto livre ou lista? (provável texto livre — é histórico).
- ⚠️ Upload de imagem depende do **R2 (última etapa)** — no dev, URL externa ou storage local.

## 7. Ordem de ataque
1. Backend `FotoGaleria` + CRUD.
2. Admin: aba Galeria (grid + form de foto/legenda).
3. Público: ligar `Gallery` na API + ajustar legenda pra aparecer automaticamente.
4. Upload real junto do R2, no fim.

---
name: dcp
description: >-
  DCP = Deploy (Supabase MCP) → Commit → Push. Use always after Supabase database
  changes (migrations, schema, RLS, RPC, storage policies, functions, seed SQL),
  when the user says DCP, or when finishing any backend/database task that altered
  the remote schema or migration files.
---

# DCP — Deploy, Commit, Push

Pipeline obrigatório após alterações no banco Supabase deste projeto.

**Projeto Supabase:** Mars Sound (`project_id`: `kacqyrjkkdyznercqhwh`)

Ordem fixa: **D → C → P**. Não pule etapas. Não inverta.

## Quando executar

- Usuário pede **DCP**
- Qualquer migration / DDL / RLS / Storage policy / função SQL / seed aplicado ou alterado
- Ao concluir trabalho do arquiteto de backend Supabase que mexe no banco

## Checklist

```
DCP:
- [ ] D — Deploy via MCP
- [ ] C — Commit
- [ ] P — Push
```

## D — Deploy via MCP

1. Confirme o `project_id` (`kacqyrjkkdyznercqhwh`) com `list_projects` se houver dúvida.
2. Persista o SQL em `supabase/migrations/` com nome descritivo (`YYYYMMDDHHMMSS_nome.sql`).
3. Aplique no remoto com MCP `apply_migration`:
   - `project_id`: `kacqyrjkkdyznercqhwh`
   - `name`: snake_case (sem timestamp)
   - `query`: SQL completo da migration
4. Edge Functions (se houver): `deploy_edge_function` via MCP.
5. Valide: `list_migrations` e, se útil, `get_advisors` / `list_tables`.
6. **Só avance para Commit se o deploy remoto tiver sucesso.**

Não use `execute_sql` para DDL permanente — use `apply_migration`.

## C — Commit

1. `git status` + `git diff` (staged e unstaged).
2. Inclua migrations e arquivos de app que dependem da mudança.
3. **Não** commite `.env`, keys ou secrets.
4. Commit no padrão do repo (`feat:`, `fix:`, `chore:`), mensagem curta focada no porquê.
5. Prefixo sugerido para schema: `feat(db):` ou `fix(db):`.

PowerShell (Windows):

```powershell
git add supabase/migrations/ <outros-arquivos-relacionados>
git commit -m @"
feat(db): descrição curta do porquê

"@
```

## P — Push

```powershell
git push -u origin HEAD
```

Confirme com `git status` que a branch está limpa e alinhada ao remote.

## Regras

- Sem autorização explícita do usuário: não rode DCP destrutivo (drop em massa, wipe, reset de branch remota).
- Se o Deploy falhar: pare, reporte o erro, não faça Commit/Push da migration quebrada.
- Se não houver mudança de banco pendente: diga que o DCP de DB não se aplica; só Commit/Push se o usuário pediu versionar outra coisa.
- Após DCP, informe em 1–3 linhas: o que foi deployado, hash/mensagem do commit, e que o push foi feito.

## Exemplo de fechamento

> DCP ok — migration `add_track_status` aplicada no Mars Sound; commit `abc1234` (`feat(db): ...`); push em `origin/main`.

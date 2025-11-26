# Problema de Logout Inesperado

## Causa Raiz

O sistema está deslogando os usuários inesperadamente devido a uma dessincronização entre o estado de autenticação do servidor e do cliente na aplicação Next.js.

### Detalhamento do Fluxo com Falha:

1.  **Validação no Servidor:** Uma sessão de usuário é validada corretamente no lado do servidor (Server Component) quando uma rota protegida é acessada, como o dashboard. Isso é feito usando um cliente Supabase configurado para o ambiente de servidor.

2.  **Não Propagação da Sessão:** O objeto da sessão, embora validado no servidor, não é passado para o ambiente do cliente durante o processo de "hidratação" da página no navegador.

3.  **Leitura de Cookie com Falha no Cliente:** O cliente Supabase do lado do navegador (`frontend/src/lib/supabase/client.ts`) é inicializado sem uma sessão inicial. Ele então tenta ler a sessão manualmente a partir dos cookies do navegador, utilizando um código personalizado e frágil.

4.  **Conclusão Incorreta:** Este código personalizado falha ao interpretar o cookie de sessão. Como resultado, a instância do Supabase no cliente conclui que não há uma sessão ativa.

5.  **Logout:** Qualquer lógica no lado do cliente (Client Component) que depende da verificação de autenticação (por exemplo, para exibir informações do usuário ou proteger rotas de cliente) determina incorretamente que o usuário está deslogado, causando redirecionamentos ou a perda de acesso a funcionalidades.

Em resumo, a falha não está na autenticação em si, mas na forma como o estado de "autenticado" é comunicado e sincronizado do servidor para o cliente. A implementação manual e defeituosa da leitura de cookies no cliente é o ponto central do problema.

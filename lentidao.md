# Análise de Lentidão na Aplicação

## Motivo da Lentidão

A análise do código da aplicação revelou que a página principal (`/oportunidades`) estava a executar duas consultas ao banco de dados de forma sequencial, uma a seguir à outra.

1.  **Consulta 1:** Buscava os dados de "Oportunidades".
2.  **Consulta 2:** Buscava os dados de "Produtos".

O sistema esperava a primeira consulta ser totalmente concluída para então iniciar a segunda. Como resultado, o tempo de carregamento da página era a **soma** do tempo de resposta das duas consultas. Se a primeira levasse 2 segundos e a segunda 3 segundos, a página demoraria no mínimo 5 segundos para começar a ser exibida para o usuário.

## Solução Aplicada

Para resolver este problema de performance, as duas consultas foram refatoradas para serem executadas em **paralelo**.

Utilizando `Promise.all`, as duas chamadas ao banco de dados agora são iniciadas simultaneamente. Em vez de o tempo total ser a soma das duas, ele passa a ser ditado pela consulta mais demorada das duas.

**Exemplo:**
*   **Antes:** `Tempo total = (Tempo da Consulta 1) + (Tempo da Consulta 2)`
*   **Agora:** `Tempo total = Max(Tempo da Consulta 1, Tempo da Consulta 2)`

Esta otimização reduz significativamente o tempo de espera do servidor, resultando num carregamento de página muito mais rápido e eficiente.

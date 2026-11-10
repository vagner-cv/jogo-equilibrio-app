# Equilíbrio

Arcade de precisão inspirado na mecânica do Ice Cold Beer (Taito). Uma interpretação visual própria: dois joysticks movem as extremidades de uma barra e uma esfera de aço deve alcançar os buracos numerados em sequência. Sem login, backend ou serviços pagos.

## Desenvolvimento

Requer Node.js 24 e npm. Use o checkout existente; cada tarefa na nuvem já tem um ambiente isolado, sem necessidade de worktree.

```sh
npm ci
npm run dev
```

O Vite escuta na porta 5173. Para testar no iPhone em uma rede local, abra o endereço IP do computador com essa porta; HTTPS é necessário para instalar o service worker. Em produção, use a URL HTTPS da Vercel.

```sh
npm run build
npm test
npm run test:e2e
```

Os testes do navegador usam Chromium do sistema quando disponível. Em outro computador, execute `npx playwright install chromium` antes. Os testes validam a interface em tamanhos de iPhone e eventos de toque simultâneos; não substituem testes em Safari e aparelhos reais.

## Publicar na Vercel

1. Envie as alterações deste projeto para o repositório GitHub.
2. Na Vercel, importe `vagner-cv/jogo-equilibrio-app` (ou use o projeto Vercel já conectado a esse repositório).
3. Selecione o framework **Vite**, comando de build `npm run build` e saída `dist`. A raiz é a pasta que contém `package.json` (a raiz do repositório).
4. Publique e abra a URL HTTPS no Safari do iPhone.
5. Opcional: no Safari, Compartilhar → Adicionar à Tela de Início.

`vercel.json` já contém a configuração. Nenhuma variável de ambiente, chave ou Supabase é necessária. Esta configuração não publica o jogo automaticamente a partir do ambiente de desenvolvimento; é preciso conectar o repositório à sua conta Vercel.

## Como jogar

- Arraste cada joystick para cima ou para baixo. Cada um move sua própria extremidade da barra. Soltar desacelera o motor até parar.
- Suba ambos para elevar a esfera; mude a inclinação para fazê-la rolar.
- Mire no alvo iluminado, de 01 a 07. Todos os outros buracos, inclusive os alvos ainda inativos, custam uma esfera.
- Você começa com três esferas. Cada acerto ou erro reposiciona a barra na base; a sequência dos alvos continua após um erro.
- Computador: W/S para a esquerda e ↑/↓ para a direita. Espaço pausa.
- O som é opcional. Trocar de aplicativo ou perder o foco pausa a partida automaticamente.
- O recorde fica apenas no armazenamento local do navegador. Limpar os dados do site apaga o recorde.

## Física e arquitetura

`src/physics.ts` contém a simulação independente da interface, em unidades SI e passos fixos de 1/240 s. Usa o fator de rolamento 5/7 de uma esfera sólida, gravidade tangencial, aceleração do centro da barra, termo centrífugo, resistência ao rolamento, aceleração limitada dos motores, limites mecânicos e restituição nas extremidades. A captura verifica a folga geométrica entre esfera e abertura. O tempo acumulado é limitado após travamentos para impedir saltos grandes na simulação.

É um modelo de esfera em contato com uma barra ideal: não é uma simulação 3D completa de saltos, atrito de Coulomb, contatos e profundidade. A queda no buraco tem animação visual. A sensação de controle e o desempenho ainda devem ser ajustados com testes em iPhones reais.

A renderização usa Canvas 2D, com materiais procedurais, sem fontes externas ou imagens remotas. Interface e controles usam Pointer Events com captura por ponteiro. O build funciona como site estático. Um service worker guarda o shell e os assets para uso offline após a primeira instalação bem-sucedida; atualizações são aplicadas ao reabrir o aplicativo depois de fechar as abas antigas.

## Evolução para produto

O Supabase poderá fornecer autenticação, perfis, progresso e ranking. Nenhuma integração ou credencial de Supabase é incluída nesta versão. Rankings competitivos precisarão de validação de resultados no servidor; pontuação apenas no cliente não oferece proteção contra fraude.

A publicação futura na App Store exige empacotamento iOS (por exemplo, Capacitor), projeto Xcode, assinatura Apple Developer, ícones e materiais de loja, políticas de privacidade e testes em aparelhos reais. Esta entrega é uma PWA pronta para hospedagem web, não um binário iOS assinado.

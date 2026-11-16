# Petit Gâteau

Loja online de cupcakes feita com **Svelte + TypeScript** e **Firebase** (Authentication + Realtime Database). O cliente escolhe um cupcake pronto ou monta o seu, faz o pedido e acompanha o status. O administrador gerencia pedidos, o cardápio e os sabores.

## Funcionalidades

**Cliente**
- Catálogo de cupcakes prontos, com opção de personalizar qualquer um deles.
- "Build your own": escolha de bolo, cobertura, recheio e topping, com prévia em SVG e preço calculado na hora.
- Carrinho persistido por usuário no Firebase (itens adicionados antes do login são mesclados ao entrar).
- Edição de itens no carrinho: quantidade (botões − / +) e composição do cupcake.
- Pedidos: finalizar compra, acompanhar o status e cancelar o próprio pedido (enquanto não estiver entregue ou cancelado).

**Administrador**
- Painel com receita, número de pedidos, cupcakes vendidos e quantidade na fila de produção.
- Alteração do status de qualquer pedido (`pending`, `baking`, `ready`, `delivered`, `cancelled`).
- Ativar/desativar cupcakes prontos ("On sale").
- Ativar/desativar sabores individuais (bolo, cobertura, recheio, topping). Cupcakes prontos que usam um sabor desativado deixam de aparecer na loja.

## Tecnologias

- [Svelte](https://svelte.dev/) + TypeScript
- [Firebase](https://firebase.google.com/): Authentication (e-mail/senha) e Realtime Database

## Estrutura do projeto

Organização no estilo MVC, com stores do Svelte para o estado global.

```
src/
├── components/        # Telas e componentes (View)
│   ├── App.svelte         # Roteamento simples por store `view`
│   ├── Header.svelte
│   ├── Catalog.svelte     # Cupcakes prontos
│   ├── Builder.svelte     # Montar o próprio cupcake
│   ├── Cart.svelte        # Carrinho e edição de itens
│   ├── Auth.svelte        # Login / cadastro
│   ├── Dashboard.svelte   # "My orders" (cliente) ou painel (admin)
│   └── CupcakeSvg.svelte  # Desenho do cupcake (só apresentação)
├── controllers/       # Lógica de aplicação e acesso ao Firebase
│   ├── authController.ts
│   ├── cartController.ts
│   ├── catalogController.ts
│   └── orderController.ts
├── models/            # Tipos e regras puras (sem Firebase)
│   ├── types.ts
│   ├── cartModel.ts
│   ├── productModel.ts
│   └── orderModel.ts
├── stores/            # Stores do Svelte (user, cart, orders, view, ...)
└── services/
    └── firebase.ts    # Inicialização do Firebase
```

Os valores monetários são calculados em centavos nos models para evitar erros de ponto flutuante.

## Como rodar

> Os comandos abaixo são os padrões; confirme os nomes dos scripts no seu `package.json`.

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Crie um projeto no [Firebase Console](https://console.firebase.google.com/), ative **Authentication → E-mail/senha** e crie um **Realtime Database**.
3. Coloque as credenciais do seu app web Firebase em `src/services/firebase.ts`.
4. Carregue o cardápio inicial (sabores e cupcakes prontos) no banco:
   ```bash
   npm run seed
   ```
5. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Modelo de dados (Realtime Database)

| Caminho | Conteúdo |
| --- | --- |
| `users/{uid}` | `name`, `email`, `role` (`customer` ou `admin`) |
| `options/{id}` | `type` (`base`, `frosting`, `filling`, `topping`), `name`, `color`, `shape?`, `price`, `active?` |
| `products/{id}` | `name`, `description`, `price`, `active`, `recipe` (`base`, `frosting`, `filling`, `topping` com ids de `options`) |
| `carts/{uid}/items` | Lista de itens do carrinho (`key`, `productId`, `name`, `detail?`, `unitPrice`, `qty`, `colors`, `recipe?`) |
| `orders/{id}` | `uid`, `customer`, `email`, `items`, `total`, `status`, `createdAt`, `cancelledAt?` |

Sabores sem o campo `active` são considerados disponíveis. Sabores nunca são apagados, apenas desativados, porque cupcakes prontos e carrinhos referenciam o id deles.

## Administrador

Todo cadastro novo entra como `customer`. Para promover alguém a admin, edite no console do Firebase o nó `users/{uid}/role` para `admin`. A pessoa precisa sair e entrar de novo.

## Regras de segurança

A interface esconde ações, mas quem de fato protege os dados são as **regras do Realtime Database**. Elas precisam, no mínimo, permitir:

- cliente: ler e escrever o próprio carrinho; criar pedidos com o próprio `uid`; ler os próprios pedidos; cancelar o próprio pedido (`status` → `cancelled` e `cancelledAt`) enquanto ele não estiver entregue ou cancelado;
- admin: ler e alterar todos os pedidos; alterar `active` em `products` e `options`;
- `orders` com `.indexOn: ["uid"]`, usado na consulta dos pedidos do cliente.

Exemplo para o cancelamento pelo cliente (adapte e teste no Rules Playground):

```json
"orders": {
  ".indexOn": ["uid"],
  "$orderId": {
    ".write": "auth != null && (root.child('users/' + auth.uid + '/role').val() === 'admin' || (!data.exists() && newData.child('uid').val() === auth.uid))",
    "status": {
      ".write": "auth != null && data.parent().child('uid').val() === auth.uid && newData.val() === 'cancelled' && data.val() !== 'delivered' && data.val() !== 'cancelled'"
    },
    "cancelledAt": {
      ".write": "auth != null && data.parent().child('uid').val() === auth.uid && newData.parent().child('status').val() === 'cancelled'"
    }
  }
}
```

Se mudar a regra de cancelamento no código (`canCancel` em `orderController.ts`), mantenha as regras do banco em sincronia.

## Status dos pedidos

`pending` → `baking` → `ready` → `delivered`, ou `cancelled` a qualquer momento antes da entrega. Pedidos cancelados não entram na receita nem na contagem de cupcakes vendidos do painel.
# Zoom · Controle

Controle de zoom em slides por reconhecimento de gestos, usando visão computacional treinada com **Teachable Machine** e rodando ao vivo no navegador via webcam.

**Dupla:** LiLa · Eduardo Duarte

---

## 📽️ Demonstração

![Demonstração do projeto funcionando](./docs/gif_ia_atv.gif)

> A câmera captura o gesto da mão, o modelo classifica em tempo real, e o slide aplica o zoom automaticamente conforme a predição.

---

## 🧠 Sobre o projeto

O **Zoom Controle** é uma aplicação que permite controlar o zoom de um slide/imagem em apresentação usando apenas gestos de mão, capturados pela webcam e classificados por um modelo de machine learning treinado no [Teachable Machine](https://teachablemachine.withgoogle.com/).

A ideia surgiu como uma forma de tornar apresentações mais dinâmicas e "hands-free" — útil, por exemplo, para quem está apresentando um slide de longe e quer destacar uma parte específica da imagem sem precisar tocar no notebook ou usar um controle remoto.

O modelo classifica o frame da webcam em uma de três classes, e cada classe dispara uma ação diferente na interface:

| Classe treinada | Ação disparada |
|---|---|
| `neutro` | Mantém o zoom atual (nenhuma ação) |
| `zoom mais` | Aumenta o zoom do slide |
| `zoom menos` | Diminui o zoom do slide |

A predição só é aplicada quando a confiança do modelo ultrapassa um limiar mínimo (60%) — isso evita que ruído ou gestos ambíguos disparem zoom sem querer.

---

## ⚠️ Condições de treinamento e limitações conhecidas

O modelo foi treinado com amostras capturadas em **fundo liso (branco/preto) e sem outras pessoas ou corpo no enquadramento** — apenas a mão fazendo cada gesto, isolada no fundo.

Isso tem um efeito direto na precisão em cenários diferentes do treino:

- A classe `neutro` foi treinada com o fundo vazio, **não** com uma pessoa parada em frente à câmera. Por isso, ter alguém parado no quadro nem sempre é classificado como `neutro` com alta confiança — o modelo não "viu" esse padrão durante o treino.
- As classes de gesto (`zoom mais` / `zoom menos`) foram treinadas com a mão sozinha, sem corpo na amostra. Funcionam de forma consistente (confiança alta, geralmente 90%+) quando o cenário se aproxima do treino: fundo simples e mão isolada no quadro.
- Em ambientes com fundo poluído, pouca luz, ou com o corpo da pessoa muito visível atrás da mão, a confiança tende a cair — e como a aplicação só age quando a confiança ultrapassa o limiar de 60%, gestos em condições muito diferentes do treino podem ser ignorados (o que é o comportamento esperado do sistema, não um bug).

**Para melhores resultados ao testar:** use um fundo neutro/liso atrás da mão, boa iluminação, e mantenha o gesto claramente visível e isolado no quadro, similar às condições de treinamento.

Esse é um limite conhecido de modelos treinados no Teachable Machine com poucas variações de amostra — generalizam bem para cenários parecidos com o dataset, mas perdem precisão fora dele. Uma extensão futura do projeto seria re-treinar o modelo com amostras em fundos variados (incluindo pessoas atrás) para aumentar a robustez.

---

## 🛠️ Tecnologias usadas

- **Vite** — bundler e dev server
- **Teachable Machine (`@teachablemachine/image`)** — carregamento e inferência do modelo treinado
- **TensorFlow.js (`@tensorflow/tfjs`)** — motor de machine learning no navegador
- **HTML / CSS / JavaScript puro** — interface e lógica de interação

---

## 🚀 Como rodar localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) instalado (versão 18 ou superior recomendada)
- Um navegador com acesso à webcam

### Passo a passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/EduardoSDuarte/zoom-controle.git
   cd zoom-controle
   ```

2. **Instale as dependências:**
   ```bash
   npm install --legacy-peer-deps
   ```
   > ⚠️ A flag `--legacy-peer-deps` é necessária porque a biblioteca `@teachablemachine/image` declara uma versão antiga do TensorFlow.js como dependência, o que gera conflito com a versão mais recente usada no projeto. A instalação funciona normalmente com essa flag.

3. **Rode o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Abra o link exibido no terminal** (geralmente `http://localhost:5173`) no navegador.

5. **Permita o acesso à webcam** quando o navegador solicitar.

6. Faça os gestos treinados na frente da câmera e veja o zoom do slide reagir em tempo real.

---

## 📁 Estrutura do projeto

```
zoom-controle/
├── public/
│   ├── model.json         # arquitetura do modelo treinado
│   ├── metadata.json      # metadados e nomes das classes
│   └── weights.bin        # pesos do modelo treinado
├── src/
│   ├── assets/             # imagens usadas no slide de demonstração
│   ├── main.js             # carrega o modelo, webcam e roda a predição contínua
│   ├── ui.js                # consome as predições e atualiza a interface (barras, zoom, feedback)
│   └── style.css            # estilização do painel
├── index.html
└── package.json
```

---

## 👥 Divisão do trabalho

- **Eduardo** — treinamento do modelo no Teachable Machine, setup do projeto com Vite, integração da webcam e da inferência (`main.js`)
- **Monique** — interface do painel (HTML/CSS/JS), lógica de reação às predições (`ui.js`), integração final entre as duas partes e testes

O histórico de commits reflete a contribuição de ambos os integrantes ao longo do desenvolvimento.
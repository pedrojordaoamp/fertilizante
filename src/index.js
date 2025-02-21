const { App } = require('@slack/bolt');
require('dotenv').config();

// Inicia o app com o bot token e signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Objeto para armazenar os dados selecionados
let selectedData = {
  users: [],
  feelings: [],
  competencies: [],
  situation: '',
};

(async () => {
  // Inicia o app
  await app.start(process.env.PORT || 8080);
  console.log('⚡️ Hello World.. Bolt app is running!');
})();

// Listener para a seleção de múltiplos usuários
app.action('multi_users_select-action', async ({ ack, action }) => {
  await ack();
  console.log('Payload recebido (multi_users_select-action):', action); // Log para depuração
  selectedData.users = action.selected_users; // Armazena os usuários selecionados
  console.log('Usuários selecionados:', selectedData.users); // Log para depuração
});

// Listener para a seleção de sentimentos
app.action('sentimentos-action', async ({ ack, action, body }) => {
  await ack();
  if (body.view.blocks.find(block => block.block_id === 'feelings_block')) {
    selectedData.feelings = action.selected_options.map(option => option.value);
    console.log('Sentimentos selecionados:', selectedData.feelings); // Log para depuração
  }
});
  
// Listener para a seleção de competências
app.action('competencias-action', async ({ ack, action, body }) => {
  await ack();
  if (body.view.blocks.find(block => block.block_id === 'competencies_block')) {
    selectedData.competencies = action.selected_options.map(option => option.value);
    console.log('Competencias selecionadas:', selectedData.competencies); // Log para depuração
  }
});
  
// Listener para a entrada de texto
app.action('plain_text_input-action', async ({ ack, body }) => {
  await ack();
  // Acessa o valor do campo de texto
  const blockId = 'situation_block'; // block_id correto
  const actionId = 'situacao-action'; // action_id correto
  const inputValue = body.view.state.values[blockId][actionId].value;
  
  selectedData.situation = inputValue; // Armazena o texto inserido
  console.log('Situação descrita:', selectedData.situation); // Log para depuração
});

// Atende o app_home_opened event
app.event('app_home_opened', async ({ event, say, client }) => {
  console.log('⚡️ Hello! Someone just opened the app to DM so we will send them a message!');
  say(`Olá <@${event.user}>! Vamos dar um Grow? :seedling:`);

  try {
    // Publica a view inicial
    await client.views.publish({
      user_id: event.user,
      view: {
        type: 'home',
        callback_id: 'home_view',
        blocks: [
          {
            type: 'image',
            image_url:
              'https://images.pexels.com/photos/807598/pexels-photo-807598.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            alt_text: '',
          },
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: 'Olá Amperer! Vamos dar um Grow? :seedling:',
              emoji: true,
            },
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Iniciar',
                  emoji: true,
                },
                value: 'click_me_123',
                action_id: 'button',
              },
            ],
          },
        ],
      },
    });
  } catch (error) {
    console.error(error);
  }
});

// Listener para o botão "Iniciar"
app.action('button', async ({ body, ack, client }) => {
  await ack();
  try {
    // Atualiza a view com os selects e input
    await client.views.update({
      view_id: body.view.id,
      hash: body.view.hash,
      view: {
        type: 'home',
        callback_id: 'home_view',
        blocks: [
          {
            type: 'section',
            block_id: 'users_block', // Adiciona block_id
            text: {
              type: 'mrkdwn',
              text: 'Selecione o(s) membro(s)',
            },
            accessory: {
              type: 'multi_users_select', // Usa multi_users_select em vez de users_select
              placeholder: {
                type: 'plain_text',
                text: 'Select users',
                emoji: true,
              },
              action_id: 'multi_users_select-action',
            },
          },
          {
            type: 'section',
            block_id: 'feelings_block', // Adiciona block_id
            text: {
              type: 'mrkdwn',
              text: 'Como fez eu me sentir',
            },
            accessory: {
              type: 'multi_static_select',
              placeholder: {
                type: 'plain_text',
                text: 'Select options',
                emoji: true,
              },
              options: [
                // Opções de sentimentos
                { text: { type: 'plain_text', text: 'Feliz', emoji: true }, value: 'Feliz' },
                { text: { type: 'plain_text', text: 'Tranquilo', emoji: true }, value: 'Tranquilo' },
                { text: { type: 'plain_text', text: 'Motivado', emoji: true }, value: 'Motivado' },
                { text: { type: 'plain_text', text: 'Satisfeito', emoji: true }, value: 'Satisfeito' },
                { text: { type: 'plain_text', text: 'Valorizado', emoji: true }, value: 'Valorizado' },
                { text: { type: 'plain_text', text: 'Confiante', emoji: true }, value: 'Confiante' },
                { text: { type: 'plain_text', text: 'Entusiasmado', emoji: true }, value: 'Entusiasmato' },
                { text: { type: 'plain_text', text: 'Aliviado', emoji: true }, value: 'Aliviado' },
                { text: { type: 'plain_text', text: 'Surpreso', emoji: true }, value: 'Surpreso' },
                { text: { type: 'plain_text', text: 'Especial', emoji: true }, value: 'Especial' },
              ],
              action_id: 'sentimentos-action',
            },
          },
          {
            type: 'section',
            block_id: 'competencies_block', // Adiciona block_id
            text: {
              type: 'mrkdwn',
              text: 'Competência(s)',
            },
            accessory: {
              type: 'multi_static_select',
              placeholder: {
                type: 'plain_text',
                text: 'Select options',
                emoji: true,
              },
              options: [
                // Opções de competências
                { text: { type: 'plain_text', text: 'Organização', emoji: true }, value: 'Organização' },
                { text: { type: 'plain_text', text: 'Planejamento', emoji: true }, value: 'Planejamento' },
                { text: { type: 'plain_text', text: 'Foco em Resultado', emoji: true }, value: 'Foco em Resultado' },
                { text: { type: 'plain_text', text: 'Flexibilidade', emoji: true }, value: 'Flexibilidade' },
                { text: { type: 'plain_text', text: 'Adaptação', emoji: true }, value: 'Adaptação' },
                { text: { type: 'plain_text', text: 'Proatividade', emoji: true }, value: 'Proatividade' },
                { text: { type: 'plain_text', text: 'Comunicação', emoji: true }, value: 'Comunicação' },
                { text: { type: 'plain_text', text: 'Liderança', emoji: true }, value: 'Liderança' },
                { text: { type: 'plain_text', text: 'Empatia', emoji: true }, value: 'Empatia' },
                { text: { type: 'plain_text', text: 'Comprometimento', emoji: true }, value: 'Comprometimento' },
                { text: { type: 'plain_text', text: 'Responsabilidade', emoji: true }, value: 'Responsabilidade' },
                { text: { type: 'plain_text', text: 'Senso de Excelência', emoji: true }, value: 'Senso de Excelência' },
                { text: { type: 'plain_text', text: 'Sentimento de Dono', emoji: true }, value: 'Sentimento de Dono' },
                { text: { type: 'plain_text', text: 'Cooperação', emoji: true }, value: 'Coperação' },
                { text: { type: 'plain_text', text: 'Transparência', emoji: true }, value: 'Transparência' },
                { text: { type: 'plain_text', text: 'Espirito de Equipe', emoji: true }, value: 'Espirito de Equipe' },
              ],
              action_id: 'competencias-action',
            },
          },
          {
            type: 'input',
            block_id: 'situation_block', // Adiciona block_id
            element: {
              type: 'plain_text_input',
              multiline: true,
              action_id: 'situacao-action',
            },
            label: {
              type: 'plain_text',
              text: 'Descreva a situação',
              emoji: true,
            },
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Enviar',
                  emoji: true,
                },
                value: 'click_me_123',
                action_id: 'button_2',
              },
            ],
          },
        ],
      },
    });
  } catch (error) {
    console.error(error);
  }
});

// Listener para o botão "Enviar"
app.action('button_2', async ({ body, ack, client }) => {
  await ack();
  try {
    // Verifica se há um usuário selecionado
    if (!selectedData.users || selectedData.users.length === 0) {
      throw new Error('Nenhum usuário selecionado.');
    }

    // Acessa o valor do campo de texto
    const blockId = 'situation_block'; // block_id correto
    const actionId = 'situacao-action'; // action_id correto
    const inputValue = body.view.state.values[blockId][actionId].value;

    // Armazena o texto inserido
    selectedData.situation = inputValue;
    console.log('Situação descrita:', selectedData.situation); // Log para depuração

    // Obtém o ID do usuário que acionou o evento
    const userId = body.user.id;

    // Formata sentimentos e competências como listas
    const formatarLista = (itens) => {
      return itens.map(item => `- _${item}_`).join('\n');
    };

    const sentimentosLista = formatarLista(selectedData.feelings);
    const competenciasLista = formatarLista(selectedData.competencies);

    // Envia a mensagem direta para o(s) usuário(s) selecionado(s)
    for (const user of selectedData.users) {
      await client.chat.postMessage({
        channel: user,
        text: 'Você recebeu um feedback!', // Texto simples para notificações
        blocks: [
          {
            type: 'image',
            image_url: 'https://images.pexels.com/photos/807598/pexels-photo-807598.jpeg', // URL da imagem de fundo
            alt_text: 'Imagem de fundo',
          },
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: ':seedling: VOCÊ FOI FERTILIZADO! :index_pointing_at_the_viewer: :seedling:',
              emoji: true,
            },
          },
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: 'Enviado por:',
              emoji: true,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `<@${userId}>`,
            },
          },
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: 'Sentimentos:',
              emoji: true,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: sentimentosLista,
            },
          },
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: 'Competências:',
              emoji: true,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: competenciasLista,
            },
          },
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: 'Situação:',
              emoji: true,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: selectedData.situation,
            },
          },
        ],
      });
    }

    // Atualiza a view para confirmar o envio
    await client.views.update({
      view_id: body.view.id,
      hash: body.view.hash,
      view: {
        type: 'home',
        callback_id: 'home_view',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '`ENVIADO` :white_check_mark:',
            },
          },
        ],
      },
    });

    // Limpa os dados selecionados após o envio
    selectedData = {
      users: [],
      feelings: [],
      competencies: [],
      situation: '',
    };
  } catch (error) {
    console.error(error);
  }
});
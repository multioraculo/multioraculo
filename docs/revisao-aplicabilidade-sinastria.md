# Revisão de aplicabilidade das frases que citam um tipo de relação

Fonte da decisão: [aplicabilidade.ts](../lib/astro/davison/aplicabilidade.ts). Conferida a cada build por `npm run verify:sinastria-aplicabilidade` (a frase da revisão tem de ser a da glosa, e o texto neutro passa nas mesmas travas lexicais).

## Como foi feita

A busca por palavra só LOCALIZOU candidatos (`scripts/listar-frases-de-vinculo.ts`). Cada frase foi lida, e a classe é de conteúdo. A palavra sozinha não decide: "trabalho" na casa 6 é um campo da vida, "filhos de quem tem a casa" é um terceiro, e "resposta" contém "espos".

**Resultado: 65 frases nomeiam um tipo de relação** (28 `exemplo_contextual`, 37 `dependencia_real`). As 93 da contagem anterior eram acertos de palavra, e o resto (campo da vida, terceiro, idioma, falso positivo) não diz que tipo de relação as duas pessoas têm e ficou fora.

O que a revisão faz com a frase, e só isso: 
`exemplo_contextual` com texto neutro: vai ao prompt o núcleo geral, em qualquer vínculo. `exemplo_contextual` mantida: a frase vai como está (o 'tipo de relação' era um papel dito por metáfora, uma comparação ou uma atividade; trocar inventaria). `dependencia_real`: a frase só vai para os vínculos listados. O vínculo `outro` não recebe frase de dependência real, porque nada autoriza supor atração, negócio ou convívio doméstico. Nada disso toca o aspecto, o ranking, o orçamento ou a relevância: o seletor nem lê esta tabela, e a seleção é idêntica para os cinco vínculos (há teste).

## exemplo_contextual (28)

| Frase | Vai ao prompt | Por quê |
|---|---|---|
| `sun-mars#favoravel.nucleos[5]` · Em relações de trabalho, Marte pode fornecer o impulso para pôr em prática a grande estratégia concebida por quem tem o Sol. | Marte pode fornecer o impulso para pôr em prática a grande estratégia concebida por quem tem o Sol. | o trabalho ilustra a divisão entre conceber e executar |
| `sun-saturn#favoravel.nucleos[5]` · O trabalho em parceria com a disciplina de Saturno pode dar a quem tem o Sol uma experiência muito valiosa. | A parceria com a disciplina de Saturno pode dar a quem tem o Sol uma experiência muito valiosa. | o trabalho em parceria é o exemplo; o núcleo é aprender com a disciplina de Saturno |
| `sun-uranus#adverso.elaboracao[1]` · Se as duas pessoas encaram com naturalidade as diferenças de opinião e quem tem o Sol adota atitude indulgente diante das excentricidades de quem tem Urano, uma relação de trabalho satisfatória pode resultar. | Se as duas pessoas encaram com naturalidade as diferenças de opinião e quem tem o Sol adota atitude indulgente diante das excentricidades de quem tem Urano, uma relação satisfatória pode resultar. | o caminho de elaboração vale para a relação, e o trabalho era o exemplo |
| `moon-moon#favoravel.nucleos[0]` · Entre as duas pessoas pode haver apreço solidário e trabalho em harmonia, com respostas compatíveis ao cotidiano. | Entre as duas pessoas pode haver apreço solidário e cooperação em harmonia, com respostas compatíveis ao cotidiano. | trabalhar em harmonia é cooperar; o núcleo é a harmonia no cotidiano |
| `moon-neptune#favoravel.nucleos[3]` · O contato pode dar um forte laço de simpatia, nem sempre com envolvimento apaixonado, e aparece com frequência em amizades platônicas. | O contato pode dar um forte laço de simpatia, nem sempre com envolvimento apaixonado. | as amizades platônicas eram uma observação de frequência, não parte da dinâmica |
| `mercury-mars#favoravel.nucleos[4]` · A combinação dos dois talentos pode levar a planejar e realizar com êxito operações de trabalho. | A combinação dos dois talentos pode levar a planejar e realizar com êxito iniciativas em conjunto. | o núcleo é planejar e executar juntos |
| `venus-mars#favoravel.nucleos[6]` · O contato pode não indicar estímulo emocional ou físico pronunciado e, ainda assim, as duas pessoas podem trabalhar com fluidez na companhia uma da outra. | O contato pode não indicar estímulo emocional ou físico pronunciado e, ainda assim, as duas pessoas podem colaborar com fluidez na companhia uma da outra. | o núcleo é a fluidez sem estímulo pronunciado |
| `venus-mars#papeis.mars` · é o desejo e tende a tomar a iniciativa na relação romântica, com impulso e iniciativa também no trabalho em conjunto | é o desejo e tende a tomar a iniciativa na relação, com impulso e iniciativa também na atuação em conjunto | romance e trabalho eram os dois cenários do mesmo papel |
| `venus-mars#papeis.venus` · é o desejado e tende a convidar essa iniciativa e a responder com afeto, trazendo finesse e acabamento ao trabalho em conjunto | é o desejado e tende a convidar essa iniciativa e a responder com afeto, trazendo finesse e acabamento à atuação em conjunto | o trabalho em conjunto era o cenário |
| `venus-uranus#favoravel.nucleos[4]` · O contato pode enriquecer a vida social de cada pessoa e suas atividades culturais e criativas, mesmo sem romance. | O contato pode enriquecer a vida social de cada pessoa e suas atividades culturais e criativas. | o 'mesmo sem romance' dizia que a dinâmica não depende do vínculo |
| `mars-mars#favoravel.nucleos[0]` · As duas pessoas podem trabalhar juntas com harmonia. | As duas pessoas podem colaborar com harmonia. | trabalhar juntas é colaborar |
| `mars-jupiter#adverso.tensoesPossiveis[0]` · Entre pessoas imaturas deixadas a terminar um trabalho sem supervisão, o tempo pode se perder em brincadeiras intensas e a tarefa ser negligenciada. | Entre pessoas imaturas deixadas a terminar uma tarefa sem supervisão, o tempo pode se perder em brincadeiras intensas e a tarefa ser negligenciada. | o cenário é uma tarefa sem supervisão, não a relação de trabalho |
| `mars-saturn#favoravel.nucleos[3]` · Um arranjo de trabalho possível: quem tem Saturno traça os planos e quem tem Marte os executa. | Um arranjo possível: quem tem Saturno traça os planos e quem tem Marte os executa. | o núcleo é a divisão entre planejar e executar |
| `mars-uranus#adverso.nucleos[1]` · Podem ocorrer brigas violentas ocasionais, que entre pessoas em relação íntima podem apenas interromper por um tempo a relação sexual. | Podem ocorrer brigas violentas ocasionais. | a relação íntima era uma consequência dita só para esse vínculo; o núcleo é a briga ocasional |
| `jupiter-jupiter#favoravel.nucleos[1]` · Costuma haver reconhecimento comum dos fatores que mais servem ao vínculo, o que pode tornar o contato útil entre sócios. | Costuma haver reconhecimento comum dos fatores que mais servem ao vínculo. | 'entre sócios' era um exemplo de utilidade |
| `saturn-saturn#adverso.nucleos[2]` · Pode haver disputa por supremacia, cada pessoa achando que tem razão a seu modo e usando métodos tão diferentes que fica difícil achar base comum de trabalho. | Pode haver disputa por supremacia, cada pessoa achando que tem razão a seu modo e usando métodos tão diferentes que fica difícil achar base comum. | a base comum vale para qualquer vínculo |
| `uranus-pluto#favoravel.nucleos[3]` · O contato pode ser muito útil quando as duas pessoas são ambiciosas e empreendedoras, em particular numa parceria de negócios. | O contato pode ser muito útil quando as duas pessoas são ambiciosas e empreendedoras. | o núcleo é a utilidade entre pessoas ambiciosas; os negócios eram o caso particular |
| `neptune-pluto#favoravel.nucleos[0]` · Se as duas pessoas atuam em trabalho assistencial ou em atividades de natureza artística e agem com integridade madura, pode haver colaboração útil. | *(a mesma, sem alteração)* | o trabalho assistencial ou artístico é uma atividade comum às duas pessoas, e não o tipo de relação; sem ele a condição se perde |
| `sun@casa3#facilidades[4]` · Uma convivência livre e descontraída, como entre irmãos, é favorecida. | Uma convivência livre e descontraída é favorecida. | 'como entre irmãos' era uma comparação |
| `sun@casa12#facilidades[3]` · Quem recebe confidências com frequência, como clérigo ou médico, costuma ter o Sol na casa 12 de quem confia nessa pessoa, e pode estar preparado para servir quem passa por um momento difícil. | Quem recebe confidências com frequência costuma ter o Sol na casa 12 de quem confia nessa pessoa, e pode estar preparado para servir quem passa por um momento difícil. | clérigo e médico eram exemplos de quem recebe confidências |
| `jupiter@casa7#facilidades[1]` · Quem tem Júpiter pode ter prazer especial em trabalhar junto com quem tem a casa. | Quem tem Júpiter pode ter prazer especial em atuar junto com quem tem a casa. | o núcleo é o prazer de atuar junto |
| `uranus@casa10#tensoes[2]` · Quem tem a casa pode considerar que nunca trabalharia para quem tem Urano nem permitiria que essa pessoa dirigisse sua vida. | Quem tem a casa pode considerar que nunca permitiria que quem tem Urano dirigisse sua vida. | trabalhar para a pessoa era um exemplo de deixar-se dirigir |
| `moon@casa4#funcaoIntroduzida` · Quem tem a Lua pode fazer quem tem a casa se sentir em casa, por afinidade natural, e parte da família. | *(a mesma, sem alteração)* | 'parte da família' descreve um sentimento de acolhimento, e não o vínculo de família |
| `sun@casa10#tensoes[2]` · Quem tem o Sol tende a agir como figura parental, sentindo-se responsável pelo comportamento da outra pessoa. | *(a mesma, sem alteração)* | 'figura parental' é um papel dito por metáfora, e não um vínculo de família; trocá-lo inventaria |
| `moon@casa10#facilidades[3]` · Quem tem a Lua pode assumir uma atitude parental, empurrando suavemente rumo a um objetivo e protegendo a reputação de quem tem a casa de ataques. | *(a mesma, sem alteração)* | 'atitude parental' é um papel por metáfora |
| `jupiter@casa4#facilidades[1]` · Quem tem Júpiter pode assumir com naturalidade uma atitude parental diante de quem tem a casa. | *(a mesma, sem alteração)* | 'atitude parental' é um papel por metáfora |
| `saturn@casa4#funcaoIntroduzida` · Quem tem Saturno pode querer assumir diante de quem tem a casa uma responsabilidade de tipo parental. | *(a mesma, sem alteração)* | 'de tipo parental' é um papel por metáfora |
| `saturn@casa10#tensoes[1]` · Com Saturno muito aflito, quem tem Saturno pode assumir uma atitude de autoridade rígida e parental diante de quem tem a casa. | *(a mesma, sem alteração)* | 'autoridade parental' é um papel por metáfora |

## dependencia_real (37)

| Frase | Aplicável a | Por quê |
|---|---|---|
| `sun-jupiter#favoravel.nucleos[5]` · Em relações de negócios, os aspectos favoráveis podem tornar possível uma colaboração feliz e lucrativa. | trabalho | colaboração lucrativa em negócios |
| `sun-jupiter#especificos[0].nucleos[0]` · Na conjunção, com os dois corpos bem aspectados no nascimento, uma colaboração feliz e lucrativa em negócios é possível. | trabalho | colaboração lucrativa em negócios |
| `sun-neptune#adverso.tensoesPossiveis[2]` · Em colaboração de negócios, os esquemas muito imaginativos de quem tem Netuno para lances financeiros espetaculares podem exigir exame minucioso e provas práticas rigorosas antes da aprovação final. | trabalho | aprovação de esquemas financeiros |
| `jupiter-uranus#favoravel.nucleos[2]` · Em vínculo de negócios, quem tem Urano pode dar a originalidade criativa e quem tem Júpiter o capital para financiar invenções e ideias novas. | trabalho | capital e invenção num negócio |
| `saturn-pluto#favoravel.nucleos[2]` · Em vínculo de negócios, a combinação pode ajudar as pessoas a assentar o empreendimento em base firme. | trabalho | empreendimento |
| `neptune-neptune#favoravel.nucleos[1]` · No sextil, como na conjunção, a sintonia simpática pode favorecer a relação entre quem se dirige a um público e esse público ou os colegas de trabalho. | trabalho | público e colegas de trabalho |
| `venus-mars#favoravel.nucleos[4]` · Fora do romance, as duas pessoas podem trabalhar bem juntas: Marte dá iniciativa e impulso, Vênus dá finesse e acabamento. | amizade, família, trabalho | a frase se declara fora do romance |
| `venus-mars#favoravel.nucleos[5]` · Em relações sem ligação com o romance, quem tem Marte pode estimular à ação quem tem Vênus preguiçoso, e quem tem Vênus pode mostrar a quem tem Marte precipitado como agir com mais finesse. | amizade, família, trabalho | a frase se declara sem ligação com o romance |
| `venus-mars#favoravel.nucleos[0]` · O contato é o principal indicador de compatibilidade no nível físico e indica resposta pronta ao magnetismo físico um do outro. | romântico | magnetismo físico |
| `venus-mars#favoravel.nucleos[2]` · Quem tem Vênus pode dar a resposta amorosa que quem tem Marte deseja e trazer à relação uma sensação de bem-estar harmonioso. | romântico | resposta amorosa |
| `mars-pluto#favoravel.nucleos[0]` · Quem tem Marte pode fazer aflorar desejos físicos reprimidos de quem tem Plutão, o que pode despertar resposta em quem tem Marte. | romântico | desejos físicos |
| `sun@casa5#facilidades[4]` · O vínculo favorece a amizade: quem tem o Sol pode trazer alegria e sentir prazer na resposta afetuosa da outra pessoa. | amizade, romântico, família | diz que o vínculo favorece a amizade |
| `venus-mars#favoravel.nucleos[1]` · Quem tem Marte pode despertar a devoção apaixonada de quem tem Vênus, e muito afeto pode nascer de uma atração a princípio só física. | romântico | devoção apaixonada e atração física |
| `venus-uranus#favoravel.nucleos[0]` · O contato representa a capacidade de êxtase e pode significar uma relação de forte estímulo sexual. | romântico | estímulo sexual |
| `venus-uranus#favoravel.nucleos[3]` · Quem tem Urano pode se apaixonar perdidamente por quem tem Vênus, e as possibilidades românticas da combinação são consideráveis. | romântico | paixão e romance |
| `venus-uranus#favoravel.tensoesPossiveis[2]` · As possibilidades românticas não indicam necessariamente uma relação duradoura, sobretudo se as duas pessoas não forem maduras o bastante ao se conhecerem. | romântico | ressalva às possibilidades românticas |
| `venus-pluto#favoravel.nucleos[1]` · O contato pode aumentar a consciência sexual de uma pessoa em relação à outra. | romântico | consciência sexual |
| `venus-pluto#adverso.nucleos[0]` · A consciência sexual pode ficar aumentada a ponto de constranger. | romântico | consciência sexual |
| `mars-mars#favoravel.nucleos[3]` · O contato pode dar estímulo mútuo do desejo e atração intensa e apaixonada. | romântico | desejo e atração apaixonada |
| `mars-mars#especificos[0].nucleos[0]` · Na conjunção, o estímulo mútuo do desejo pode ser especialmente forte e levar a atração intensa e apaixonada. | romântico | desejo e atração apaixonada |
| `sun@casa6#tensoes[2]` · Em uma relação de trabalho, quem tem o Sol pode esperar uma recompensa digna pelos serviços. | trabalho | recompensa por serviços |
| `sun@casa10#facilidades[0]` · Quem tem o Sol pode supervisionar o trabalho de quem tem a casa e estar em posição de indicá-la para um avanço. | trabalho | supervisão no trabalho |
| `mars@casa1#facilidades[5]` · A colaboração pode funcionar muito bem numa parceria de negócios. | trabalho | parceria de negócios |
| `sun@casa8#tensoes[4]` · Pode haver atração ou repulsa sexual, conforme as circunstâncias e os aspectos recebidos pelo Sol. | romântico | atração sexual |
| `venus@casa5#facilidades[2]` · A posição pode indicar associação romântica quando a idade das duas pessoas é adequada. | romântico | associação romântica |
| `venus@casa8#facilidades[0]` · Pode haver considerável atração sexual entre as duas pessoas. | romântico | atração sexual |
| `mars@casa2#facilidades[2]` · Pode haver forte estímulo sexual entre as duas pessoas, e o desfecho depende dos aspectos entre os mapas. | romântico | estímulo sexual |
| `mars@casa5#facilidades[3]` · Pode haver um vínculo apaixonado entre as duas pessoas. | romântico | vínculo apaixonado |
| `mars@casa8#facilidades[2]` · Pode haver forte atração sexual entre as duas pessoas. | romântico | atração sexual |
| `jupiter@casa12#tensoes[1]` · Havendo vínculo romântico entre as duas pessoas, pode haver risco de escândalo. | romântico | vínculo romântico |
| `uranus@casa5#facilidades[3]` · O vínculo pode estimular um interesse romântico mútuo, mas por si só não implica permanência. | romântico | interesse romântico |
| `uranus@casa7#facilidades[2]` · Num vínculo romântico, quem tem Urano pode exercer certo fascínio. | romântico | vínculo romântico |
| `neptune@casa5#facilidades[2]` · Pode estimular sonhos de romance ou fantasias românticas compartilhadas. | romântico | romance |
| `neptune@casa5#facilidades[3]` · Pode desafiar a viver à altura dos mais altos ideais românticos, lembrando que o amor pode pedir entrega e disposição ao sacrifício. | romântico | ideais românticos |
| `neptune@casa8#tensoes[5]` · Se há relação sexual, o vínculo pode trazer problemas de desejo não satisfeito. | romântico | relação sexual |
| `jupiter@casa5#facilidades[5]` · Pode haver uma amizade romântica, com muito afeto mútuo. | romântico, amizade | amizade romântica: só entre vínculos de afeto |
| `moon@casa10#facilidades[4]` · Pode haver um vínculo doméstico entre as duas pessoas. | romântico, família | vínculo doméstico: convívio sob o mesmo teto |

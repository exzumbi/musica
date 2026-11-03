import { test, expect } from "@playwright/test";
import { lessons } from "../src/platform/content.ts";
async function nav(page: any, name: string) {
  await page
    .getByRole("navigation", { name: "Navegação principal" })
    .getByRole("button", { name, exact: true })
    .click();
}
async function lesson(page: any, index: number) {
  await page.locator(".course-outline button").nth(index).click();
}
test("Sete áreas, aula inicial com exercício, revisão e persistência", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.locator('nav[aria-label="Navegação principal"] button'),
  ).toHaveCount(7);
  await nav(page, "Teoria musical");
  await expect(page.locator(".course-outline button")).toHaveCount(12);
  await page
    .getByRole("button", { name: "Concluir aula", exact: true })
    .click();
  await expect(page.locator(".lesson-view")).toContainText(
    "Conclua a atividade",
  );
  await page.locator(".sound-comparison button").nth(0).click();
  await page.locator(".sound-comparison button").nth(1).click();
  await page.getByRole("button", { name: "Som B", exact: true }).click();
  await expect(page.locator(".completion-badge")).toBeVisible();
  await page.locator(".review-options button").nth(1).click();
  await page
    .getByRole("button", { name: "Concluir aula", exact: true })
    .click();
  await expect(page.locator(".lesson-view")).toContainText(
    "Aula concluída e salva",
  );
  await page.reload();
  await expect(page.locator(".course-outline .done")).toHaveCount(1);
  await lesson(page, 7);
  await page
    .locator(".pitch-selector button")
    .filter({ hasText: /^Dó$/ })
    .click();
  await page
    .locator(".pitch-selector button")
    .filter({ hasText: /^Mi$/ })
    .click();
  await page
    .locator(".pitch-selector button")
    .filter({ hasText: /^Sol$/ })
    .click();
  await page
    .getByRole("button", { name: "Verificar tríade", exact: true })
    .click();
  await expect(page.locator(".completion-badge")).toBeVisible();
  await page.getByRole("checkbox", { name: "Abaixar a terça" }).check();
  await page
    .getByRole("button", { name: "Abrir no instrumento escolhido" })
    .click();
  await expect(page.locator("#result-title")).toContainText("Cm");
  await nav(page, "Música clássica");
  await expect(page.locator(".work-tabs button")).toHaveCount(5);
  await page.getByRole("button", { name: "Favoritar obra" }).click();
  await page
    .getByRole("textbox", { name: "Anotações da escuta" })
    .fill("Percebi duas camadas.");
  await nav(page, "Meus estudos");
  await expect(page.locator(".favorites-columns")).toContainText("Paixão");
  await expect(page.locator(".saved-note")).toContainText(
    "Percebi duas camadas.",
  );
  expect(errors).toEqual([]);
});
test("Pauta, construção de escala, pausa, inversão e conexão com história", async ({
  page,
}) => {
  await page.goto("/");
  await nav(page, "Teoria musical");
  await lesson(page, 2);
  await page.getByRole("button", { name: "Tocar Sol4", exact: true }).click();
  await page.getByRole("button", { name: "Verificar Sol4" }).click();
  await expect(page.locator(".completion-badge")).toBeVisible();
  await expect(page.locator(".staff-wrap svg")).toHaveAttribute(
    "aria-label",
    /Sol4/,
  );
  await lesson(page, 4);
  await page
    .getByRole("button", { name: "Adicionar Mínima", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Adicionar Semínima", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Adicionar Pausa de semínima", exact: true })
    .click();
  await page.getByRole("button", { name: "Verificar compasso" }).click();
  await expect(page.locator(".completion-badge")).toBeVisible();
  await lesson(page, 6);
  for (const name of ["Dó", "Ré", "Mi", "Fá", "Sol", "Lá", "Si"])
    await page
      .locator(".pitch-selector button")
      .filter({ hasText: new RegExp("^" + name + "$") })
      .click();
  await page.getByRole("button", { name: "Verificar escala" }).click();
  await expect(page.locator(".completion-badge")).toBeVisible();
  await lesson(page, 8);
  await page.getByRole("button", { name: "Mi · primeira inversão" }).click();
  await page.getByRole("button", { name: "Verificar C/E" }).click();
  await expect(page.locator(".completion-badge")).toBeVisible();
  await nav(page, "História da música");
  await expect(page.locator(".timeline button")).toHaveCount(8);
  await page
    .locator(".timeline button")
    .filter({ hasText: "Classicismo" })
    .click();
  await expect(page.locator(".period-detail")).toContainText("c. 1750–1820");
  await page.getByRole("button", { name: "Abrir escuta guiada" }).click();
  await expect(page.locator(".work-detail")).toContainText("Mozart");
  await nav(page, "História da música");
  await page
    .getByRole("button", { name: "Músicas no Brasil", exact: true })
    .click();
  await expect(page.locator(".brazil-grid article.content-card")).toHaveCount(
    6,
  );
});
test("Repertório importa ChordPro, transpõe baixo e letra, restaura, persiste e exporta", async ({
  page,
}) => {
  await page.goto("/");
  await nav(page, "Cifras e repertório");
  await page
    .getByRole("button", { name: "Adicionar música", exact: false })
    .first()
    .click();
  await page
    .getByRole("textbox", { name: "Título da música", exact: true })
    .fill("Minha cantiga");
  await page.getByRole("textbox", { name: "Artista da música" }).fill("Autora");
  await page
    .getByRole("textbox", { name: "Conteúdo da cifra" })
    .fill("[C/E]A casa [Am7]é minha\n[F#7(b9)/A#]Amanheceu");
  await page
    .getByRole("textbox", { name: "Tom informado na importação" })
    .fill("C");
  await page
    .getByRole("checkbox", { name: "Tenho direito de utilizar" })
    .check();
  await page
    .getByRole("button", { name: "Salvar música", exact: true })
    .click();
  await expect(page.locator(".song-heading")).toContainText("Minha cantiga");
  await page.getByRole("button", { name: "Subir cifra um semitom" }).click();
  await page.getByRole("button", { name: "Subir cifra um semitom" }).click();
  await expect(page.locator(".song-sheet")).toContainText("D/F#");
  await expect(page.locator(".song-sheet")).toContainText("G#7(b9)/C");
  await expect(page.locator(".song-sheet")).toContainText("A casa");
  await page
    .locator(".song-sheet")
    .getByRole("button", { name: "D/F#", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Diagrama do acorde da cifra" }),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Instrumento da cifra" })
    .selectOption("guitar");
  await expect(page.locator(".song-chord-inspector")).toContainText(
    "ainda não está no catálogo",
  );
  await page
    .getByRole("button", { name: "Metrônomo", exact: false })
    .filter({ hasText: "Metrônomo" })
    .last()
    .click();
  await expect(
    page.getByRole("complementary", { name: "Painel do metrônomo" }),
  ).toBeVisible();
  await expect(page.locator(".song-heading")).toContainText("Minha cantiga");
  await page
    .getByRole("button", { name: "Fechar ferramenta e interromper" })
    .click();
  await page
    .getByRole("textbox", { name: "Anotações da música" })
    .fill("Tom confortável");
  await page.reload();
  await expect(page.locator(".song-sheet")).toContainText("D/F#");
  await expect(
    page.getByRole("textbox", { name: "Anotações da música" }),
  ).toHaveValue("Tom confortável");
  await page
    .getByRole("button", { name: "Restaurar original", exact: true })
    .click();
  await expect(page.locator(".song-sheet")).toContainText("C/E");
  await expect(page.locator(".song-sheet")).not.toContainText("D/F#");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar versão original" }).click();
  expect((await download).suggestedFilename()).toBe("Minha cantiga.cho");
});
test("Importação TXT exige revisão, progresso e repertório têm backup e listas", async ({
  page,
}) => {
  await page.goto("/");
  await nav(page, "Cifras e repertório");
  await page
    .locator('input[type=file][aria-label="Importar arquivo TXT ou ChordPro"]')
    .setInputFiles({
      name: "Teste.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("C     G/B\nA casa é minha\nAm    F"),
    });
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("checkbox", { name: "Linha 1 contém acordes" }),
  ).toBeChecked();
  await expect(
    page.getByRole("checkbox", { name: "Linha 2 contém acordes" }),
  ).not.toBeChecked();
  await page
    .getByRole("checkbox", { name: "Tenho direito de utilizar" })
    .check();
  await page
    .getByRole("button", { name: "Salvar música", exact: true })
    .click();
  await page.getByRole("button", { name: "Subir cifra um semitom" }).click();
  await expect(page.locator(".lyric-line")).toContainText("A casa é minha");
  await nav(page, "Meus estudos");
  await page
    .getByRole("textbox", { name: "Anotações gerais" })
    .fill("Ouvir com calma");
  await page.getByRole("textbox", { name: "Nome da lista" }).fill("Meu sábado");
  await page.getByRole("button", { name: "Criar lista" }).click();
  await expect(page.locator(".study-list")).toContainText("Meu sábado");
  await page.locator(".study-list input[type=checkbox]").last().check();
  await expect(page.locator(".study-list")).toContainText("Estudar");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar meus estudos" }).click();
  const file = await download;
  const path = await file.path();
  expect(path).toBeTruthy();
  await page
    .getByRole("textbox", { name: "Anotações gerais" })
    .fill("Alteração temporária");
  await page
    .getByRole("button", { name: "Importar estudos", exact: true })
    .click();
  await page
    .locator('input[aria-label="Arquivo de estudos"]')
    .setInputFiles(path!);
  await page
    .getByRole("button", { name: "Importar e substituir os estudos" })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Anotações gerais" }),
  ).toHaveValue("Ouvir com calma");
  await page.reload();
  await expect(
    page.getByRole("textbox", { name: "Anotações gerais" }),
  ).toHaveValue("Ouvir com calma");
});
test("Metrônomo agenda áudio real, 6/8, volume, modo visual e exclusão mútua", async ({
  page,
}) => {
  await page.addInitScript(() => {
    (window as any).__clicks = [];
    const create = AudioContext.prototype.createOscillator;
    AudioContext.prototype.createOscillator = function () {
      const osc = create.call(this);
      const start = osc.start.bind(osc);
      osc.start = (time?: number) => {
        (window as any).__clicks.push({
          time,
          frequency: osc.frequency.value,
          now: this.currentTime,
        });
        return start(time);
      };
      return osc;
    };
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Abrir metrônomo", exact: true })
    .click();
  await page.getByRole("spinbutton", { name: "BPM", exact: true }).fill("120");
  await page.getByRole("spinbutton", { name: "BPM", exact: true }).press("Tab");
  await page
    .getByRole("combobox", { name: "Compasso", exact: true })
    .selectOption("6/8");
  await page
    .getByRole("combobox", { name: "Subdivisão", exact: true })
    .selectOption("eighth");
  await expect(page.locator(".tool-help").first()).toContainText(
    "semínima pontuada",
  );
  await page
    .getByRole("button", { name: "Iniciar metrônomo", exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => (window as any).__clicks.length))
    .toBeGreaterThan(4);
  const clicks = await page.evaluate(() => (window as any).__clicks);
  expect(clicks[0].frequency).toBe(1500);
  expect(clicks[1].time - clicks[0].time).toBeCloseTo(1 / 6, 4);
  expect(clicks[0].time).toBeGreaterThan(clicks[0].now);
  await page.getByRole("slider", { name: "Volume do metrônomo" }).fill("0.2");
  await page.getByRole("checkbox", { name: "Som desligado" }).check();
  await expect(
    page.getByRole("button", { name: "Parar metrônomo", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Minimizar ferramenta", exact: true })
    .click();
  await expect(page.locator(".tool-mini-summary")).toContainText("120 BPM");
  await page.getByRole("button", { name: "Ouvir acorde", exact: true }).click();
  await page
    .getByRole("button", { name: "Expandir ferramenta", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Iniciar metrônomo", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Interromper todos os áudios", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Interromper áudio", exact: true }),
  ).toBeDisabled();
});
test("Afinador: permissão só após ação, detecção real E2, referência pausa e libera microfone", async ({
  page,
}) => {
  await page.addInitScript(() => {
    (window as any).__micCalls = 0;
    (window as any).__micStopped = 0;
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
      value: async () => {
        (window as any).__micCalls++;
        const ac = new AudioContext();
        await ac.resume();
        const osc = ac.createOscillator();
        osc.frequency.value = 82.406889;
        const gain = ac.createGain();
        gain.gain.value = 0.3;
        const output = ac.createMediaStreamDestination();
        osc.connect(gain);
        gain.connect(output);
        osc.start();
        const track = output.stream.getTracks()[0];
        const stop = track.stop.bind(track);
        track.stop = () => {
          (window as any).__micStopped++;
          stop();
          osc.stop();
          void ac.close();
        };
        return output.stream;
      },
    });
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Abrir afinador", exact: true })
    .click();
  expect(await page.evaluate(() => (window as any).__micCalls)).toBe(0);
  await page
    .getByRole("button", { name: "Ativar microfone", exact: true })
    .click();
  await expect(page.locator(".tuner-display>p")).toHaveText("Afinado", {
    timeout: 15000,
  });
  await expect(page.locator(".tuner-display>strong")).toHaveText("Mi 2");
  await expect(page.locator(".tuner-display")).toContainText("82.4 Hz");
  await page.getByRole("button", { name: "Ouvir nota de referência" }).click();
  await expect(page.locator(".tool-status")).toContainText("Captação pausada");
  expect(
    await page.evaluate(() => (window as any).__micStopped),
  ).toBeGreaterThanOrEqual(1);
  await page
    .getByRole("button", { name: "Ativar microfone", exact: true })
    .click();
  await expect(page.locator(".tuner-display>p")).toHaveText("Afinado");
  await page
    .getByRole("button", { name: "Encerrar captação", exact: true })
    .click();
  expect(
    await page.evaluate(() => (window as any).__micStopped),
  ).toBeGreaterThanOrEqual(2);
  await expect(page.locator(".tuner-display>p")).not.toHaveText("Afinado");
});
test("Afinador trata negação de permissão sem apresentar afinação fictícia", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
      value: async () => {
        throw new DOMException("Denied", "NotAllowedError");
      },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Abrir afinador" }).click();
  await page
    .getByRole("button", { name: "Ativar microfone", exact: true })
    .click();
  await expect(page.locator(".tool-status")).toContainText("Permissão negada");
  await expect(page.locator(".tuner-display>p")).not.toHaveText("Afinado");
});
test("Todas as áreas cabem na tela, fontes sinalizadas e teclado alcança controles", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  for (const name of [
    "Prática",
    "Teoria musical",
    "Música clássica",
    "História da música",
    "Ferramentas",
    "Cifras e repertório",
    "Meus estudos",
  ]) {
    await nav(page, name);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await nav(page, "Teoria musical");
  await expect(page.locator(".source-list summary").first()).toContainText(
    "02/11/2026",
  );
  await page
    .getByRole("button", { name: "Abrir afinador", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("complementary", { name: "Painel do afinador" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Fechar ferramenta e interromper" })
    .click();
  await page.screenshot({
    path: `test-results/platform-${info.project.name}.png`,
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test("Atividades de intervalo, tons, campo harmônico, sequência e modos avaliam ações reais", async ({
  page,
}) => {
  await page.addInitScript(() => {
    (window as any).__lessonNotes = [];
    const create = AudioContext.prototype.createOscillator;
    AudioContext.prototype.createOscillator = function () {
      const osc = create.call(this);
      const start = osc.start.bind(osc);
      osc.start = (time?: number) => {
        (window as any).__lessonNotes.push(osc.frequency.value);
        return start(time);
      };
      return osc;
    };
  });
  await page.goto("/");
  await nav(page, "Teoria musical");
  await lesson(page, 3);
  await page.locator(".lab-card select").selectOption("62");
  await page.getByRole("button", { name: "Verificar um tom" }).click();
  await expect(page.locator(".completion-badge")).toBeVisible();
  await lesson(page, 5);
  await page.getByRole("button", { name: "Ouvir / repetir intervalo" }).click();
  await expect
    .poll(() => page.evaluate(() => (window as any).__lessonNotes.length))
    .toBe(2);
  const distance = await page.evaluate(() => {
    const notes = (window as any).__lessonNotes;
    return Math.round(12 * Math.log2(notes[1] / notes[0]));
  });
  const answer =
    distance === 2
      ? "Segunda maior"
      : distance === 4
        ? "Terça maior"
        : "Quinta justa";
  await page.getByRole("button", { name: answer, exact: true }).click();
  await expect(page.locator(".completion-badge")).toBeVisible();
  await lesson(page, 9);
  await page.locator(".harmonic-field button").nth(4).click();
  await page.getByRole("button", { name: "Verificar quinto grau" }).click();
  await expect(page.locator(".completion-badge")).toBeVisible();
  await lesson(page, 10);
  await page.getByRole("button", { name: "+ G", exact: true }).click();
  await page.getByRole("button", { name: "+ C", exact: true }).click();
  await page.getByRole("button", { name: "Verificar chegada G–C" }).click();
  await expect(page.locator(".completion-badge")).toBeVisible();
  await lesson(page, 11);
  for (const mode of ["major", "minor", "dorian"]) {
    await page.locator(".lab-card select").last().selectOption(mode);
    await page
      .getByRole("button", { name: "Ouvir organização", exact: true })
      .click();
  }
  await page.getByRole("button", { name: "Conferir exploração" }).click();
  await expect(page.locator(".completion-badge")).toBeVisible();
});
test("Pulsação fornece avaliação aproximada de regularidade, com alternativa por teclado", async ({
  page,
}) => {
  await page.goto("/");
  await nav(page, "Teoria musical");
  await lesson(page, 1);
  await page.clock.install();
  const pad = page.getByRole("button", { name: "Bata o pulso" });
  await pad.focus();
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Space");
    await page.clock.runFor(750);
  }
  await page.getByRole("button", { name: "Avaliar pulsação" }).click();
  await expect(page.locator(".completion-badge")).toBeVisible();
  await expect(page.locator(".exercise-feedback")).toContainText(
    "desvio médio",
  );
});
test("Afinador não confunde Mi agudo com Mi grave e libera captação ao fechar", async ({
  page,
}) => {
  await page.addInitScript(() => {
    (window as any).__released = 0;
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
      value: async () => {
        const ac = new AudioContext();
        await ac.resume();
        const osc = ac.createOscillator();
        osc.frequency.value = 329.6275569;
        const destination = ac.createMediaStreamDestination();
        const gain = ac.createGain();
        gain.gain.value = 0.25;
        osc.connect(gain);
        gain.connect(destination);
        osc.start();
        const track = destination.stream.getTracks()[0];
        const stop = track.stop.bind(track);
        track.stop = () => {
          (window as any).__released++;
          stop();
          osc.stop();
          void ac.close();
        };
        return destination.stream;
      },
    });
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Abrir afinador", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Ativar microfone", exact: true })
    .click();
  await expect(page.locator(".tuner-display>p")).toHaveText(
    "Oitava diferente: confira a corda-alvo",
  );
  await expect(page.locator(".tuner-display>strong")).toHaveText("Mi 4");
  await page
    .getByRole("button", { name: "1ª · Mi agudo · E4", exact: true })
    .click();
  await expect(page.locator(".tuner-display>p")).toHaveText("Afinado");
  await page
    .getByRole("button", { name: "Fechar ferramenta e interromper" })
    .click();
  expect(await page.evaluate(() => (window as any).__released)).toBeGreaterThan(
    0,
  );
});

import { test, expect } from "@playwright/test";
async function search(page: any, q: string) {
  await page.getByRole("textbox", { name: "Pesquisar nota ou acorde" }).fill(q);
  await page.getByRole("button", { name: "Explorar", exact: true }).click();
}
test("Busca, teoria, inversões, notas e ambiguidades", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Mi menor com sétima", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Teclado: Mi3, Sol3, Si3, Ré4" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "1ª inversão Baixo em Sol" }).click();
  await expect(
    page.getByRole("img", { name: "Teclado: Sol3, Si3, Ré4, Mi4" }),
  ).toBeVisible();
  await search(page, "Bm7");
  await expect(
    page.getByRole("heading", { name: "Si menor com sétima", exact: true }),
  ).toBeVisible();
  await search(page, "BM7");
  await expect(page.getByRole("alert")).toContainText(
    "mais de uma interpretação",
  );
  await page
    .getByRole("button", { name: "Bmaj7 — Si maior com sétima maior" })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Si maior com sétima maior",
      exact: true,
    }),
  ).toBeVisible();
  await search(page, "Dó maior com sétima maior");
  await expect(page.locator("#result-title")).toContainText("Cmaj7");
  await search(page, "C/E");
  await expect(
    page.getByRole("img", { name: "Teclado: Mi3, Sol3, Dó4" }),
  ).toBeVisible();
  await search(page, "nota F#");
  await expect(page.locator(".chord-kind")).toHaveText("NOTA ISOLADA");
  await search(page, "não existe");
  await expect(page.getByRole("alert")).toContainText("Não reconhecemos");
  expect(errors).toEqual([]);
});
test("Instrumentos, posições, canhoto, comparação e limitações", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Violão", exact: true }).click();
  await expect(page.locator("#result-title")).toContainText("Em7");
  await expect(page.locator(".chord-svg")).toBeVisible();
  await page
    .getByRole("button", { name: "Posição 2 Posição com cordas soltas" })
    .click();
  await expect(page.locator(".actual-notes")).toContainText("Ré");
  await page.getByLabel("Canhoto", { exact: true }).check();
  await expect(page.getByLabel("Canhoto", { exact: true })).toBeChecked();
  await page.getByRole("button", { name: "Cavaquinho", exact: true }).click();
  await expect(page.locator(".chord-svg")).toBeVisible();
  await page.getByRole("button", { name: "Ukulele", exact: true }).click();
  await expect(page.locator(".chord-svg")).toBeVisible();
  await search(page, "Dbaug");
  await expect(
    page.getByRole("heading", {
      name: "Essa posição ainda não está no catálogo.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Ouvir acorde", exact: true }),
  ).toBeDisabled();
  await search(page, "C");
  await page
    .getByRole("button", { name: "Comparar instrumentos", exact: true })
    .first()
    .click();
  await expect(page.locator(".compare-card")).toHaveCount(8);
  await page
    .getByRole("button", { name: "Comparar instrumentos", exact: true })
    .first()
    .click();
  await page
    .getByLabel("Selecionar qualquer instrumento")
    .selectOption("violin");
  await expect(page.locator(".study-board")).toBeVisible();
  await expect(page.locator(".diagram-footnote")).toContainText(
    "sem acordes simultâneos",
  );
  await page
    .getByLabel("Selecionar qualquer instrumento")
    .selectOption("harmonica");
  await expect(page.locator(".harmonica")).toContainText("Escolha o tipo");
  await page
    .getByRole("combobox", { name: "Tipo da gaita", exact: true })
    .selectOption("richter");
  await page
    .getByRole("combobox", { name: "Tonalidade da gaita", exact: true })
    .selectOption("C");
  await expect(page.locator(".holes td")).toHaveCount(20);
  await page
    .getByLabel("Selecionar qualquer instrumento")
    .selectOption("percussion");
  await expect(page.locator(".percussion")).toContainText(
    "não tem altura definida",
  );
});
test("Favoritos, histórico e transposição persistem; navegação por teclado", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Salvar nos favoritos" }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Remover dos favoritos" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Meus favoritos" }).click();
  await expect(page.getByRole("dialog")).toContainText("Em7");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Subir um semitom" }).click();
  await expect(page.locator("#result-title")).toContainText("Fm7");
  await page.getByRole("button", { name: "Descer um semitom" }).click();
  await expect(page.locator("#result-title")).toContainText("Em7");
  await page.getByRole("button", { name: "Histórico", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Fm7");
  await page.getByRole("button", { name: "Fechar janela" }).click();
  const input = page.getByRole("textbox", { name: "Pesquisar nota ou acorde" });
  await input.focus();
  await input.fill("Lá menor");
  await page.keyboard.press("Enter");
  await expect(page.locator("#result-title")).toContainText("Am");
  await page.getByLabel("Nomes das notas", { exact: true }).uncheck();
  await expect(page.locator(".note-pills")).toContainText("A");
});
test("Áudio inicia apenas por interação, volume e interrupção", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const AC = window.AudioContext;
    let started = 0;
    let stopped = 0;
    (window as any).__audio = {
      get started() {
        return started;
      },
      get stopped() {
        return stopped;
      },
    };
    const original = AC.prototype.createOscillator;
    AC.prototype.createOscillator = function () {
      const osc = original.call(this);
      const start = osc.start.bind(osc);
      const stop = osc.stop.bind(osc);
      osc.start = (...args: Parameters<typeof start>) => {
        started++;
        return start(...args);
      };
      osc.stop = (...args: Parameters<typeof stop>) => {
        stopped++;
        return stop(...args);
      };
      return osc;
    };
  });
  await page.goto("/");
  expect(await page.evaluate(() => (window as any).__audio.started)).toBe(0);
  await page.getByRole("button", { name: "Ouvir acorde", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Interromper áudio" }),
  ).toBeEnabled();
  await expect
    .poll(() => page.evaluate(() => (window as any).__audio.started))
    .toBe(4);
  await page.getByRole("slider", { name: "Volume", exact: true }).fill("0.3");
  await page.getByRole("button", { name: "Interromper áudio" }).click();
  await expect(
    page.getByRole("button", { name: "Interromper áudio" }),
  ).toBeDisabled();
  expect(
    await page.evaluate(() => (window as any).__audio.stopped),
  ).toBeGreaterThanOrEqual(8);
  await page.getByRole("button", { name: "Arpejo lento", exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => (window as any).__audio.started))
    .toBe(8);
  await page.getByRole("button", { name: "Interromper áudio" }).click();
});
test("Layout responsivo, rótulos SVG, foco e captura de tela", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator(".piano-svg")).toHaveAttribute(
    "aria-label",
    /Mi3, Sol3, Si3, Ré4/,
  );
  await page.getByRole("button", { name: "Fundamentos musicais" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(
    await page.evaluate(() =>
      document.querySelector("dialog")?.contains(document.activeElement),
    ),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await page.screenshot({
    path: `test-results/${testInfo.project.name}.png`,
    fullPage: true,
  });
});

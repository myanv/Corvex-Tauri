'use client';

/** 
* I used the following JS code as a reference:
*
// Source: TeXworksScript (https://raw.githubusercontent.com/henrikmidtiby/autocompleteForTexworks/master/scripts/autocomplete.js)
// Title: Context aware autocomplete
// Description: Autocompletion inspired by vim.
// Author: Henrik Skov Midtiby
// Version: 0.3
// Date: 2011-05-16
// Script-Type: standalone
// Context: TeXDocument
// Shortcut: Ctrl+M
*
**/

import * as monaco from 'monaco-editor';

interface Details {
  wordToComplete: string;
  lastGuess: string;
  commandName: string;
  extractedWord: string;
  wordStart: number;
  isCommandName: boolean;
  unclosedEnvironment: string;
  firstPlaceInLine: boolean;
}

interface SelectedWord {
  wordStart: number;
  extractedWord: string;
  lastGuess: string;
  commandName: string;
  isCommandName: boolean;
}

export function provideLatexCompletionItems(
  model: monaco.editor.ITextModel,
  position: monaco.Position
): monaco.languages.CompletionList {
  const details = collectDetailsAboutTheCurrentSelection(model, position);

  let suggestions: monaco.languages.CompletionItem[] = [];

  const wordInfo = model.getWordUntilPosition(position);
  const range = new monaco.Range(
    position.lineNumber,
    wordInfo.startColumn,
    position.lineNumber,
    wordInfo.endColumn
  );

  if (details.firstPlaceInLine && details.unclosedEnvironment) {
    suggestions.push({
      label: `\\end{${details.unclosedEnvironment}}`,
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: `end{${details.unclosedEnvironment}}\n`,
      documentation: 'Close the unclosed environment',
      range: range,
    });
    return { suggestions };
  }

  if (details.isCommandName) {
    suggestions = locateMatchingCommandNames(details.extractedWord, range);
  }
  // If completing filenames (not yet implemented due to environment limitations)
  else if (shouldCompleteFilename(details.commandName)) {
    // Implement filename completion
  }
  // General word completion
  else if (details.wordToComplete.length > 0) {
    suggestions = locateMatchingWords(details.commandName, details.extractedWord, model, position, range);
  }

  return { suggestions };
}

function collectDetailsAboutTheCurrentSelection(
  model: monaco.editor.ITextModel,
  position: monaco.Position
): Details {
  const selectedWord = locateWordEndingOnCursor(model, position);

  const textBeforeCursor = model.getValueInRange({
    startLineNumber: 1,
    startColumn: 1,
    endLineNumber: position.lineNumber,
    endColumn: position.column,
  });

  const unclosedEnvironment = locateUnclosedEnvironmentsBeforeCursor(textBeforeCursor);

  const firstPlaceInLine = position.column === 1;

  return {
    wordToComplete: selectedWord.extractedWord,
    lastGuess: selectedWord.lastGuess,
    commandName: selectedWord.commandName,
    extractedWord: selectedWord.extractedWord,
    wordStart: selectedWord.wordStart,
    isCommandName: selectedWord.isCommandName,
    unclosedEnvironment,
    firstPlaceInLine,
  };
}

function locateWordEndingOnCursor(
  model: monaco.editor.ITextModel,
  position: monaco.Position
): SelectedWord {
  let wordStartOffset = model.getOffsetAt(position);
  const text = model.getValue();

  while (wordStartOffset > 0 && isAlphaNumeric(text.charAt(wordStartOffset - 1))) {
    wordStartOffset--;
  }

  const wordEndOffset = model.getOffsetAt(position);
  const extractedWord = text.substring(wordStartOffset, wordEndOffset);
  const lastGuess = extractedWord;
  const commandName = getCommandName(text, wordStartOffset);
  let isCommandName = false;

  if (wordStartOffset > 0 && text.charAt(wordStartOffset - 1) === '\\') {
    isCommandName = true;
  }

  return {
    wordStart: wordStartOffset,
    extractedWord,
    lastGuess,
    commandName,
    isCommandName,
  };
}

function getCommandName(text: string, wordStartOffset: number): string {
  let counter = 100;
  let commandName = '';
  let index = wordStartOffset - 1;

  while (counter > 0 && isAlphaNumericKommaOrSpace(text.charAt(index))) {
    index--;
    counter--;
  }

  if (text.charAt(index) === '{') {
    index--;

    if (text.charAt(index) === ']') {
      while (counter > 0 && text.charAt(index) !== '[') {
        index--;
        counter--;
      }
      index--;
    }

    const commandEnd = index;
    while (counter > 0 && isAlphaNumeric(text.charAt(index))) {
      index--;
      counter--;
    }

    if (text.charAt(index) === '\\') {
      commandName = text.substring(index + 1, commandEnd + 1);
    }
  }

  return commandName;
}

function locateUnclosedEnvironmentsBeforeCursor(textBeforeCursor: string): string {
  const beginMatches = Array.from(textBeforeCursor.matchAll(/\\begin\{([^}]+)\}/g));
  const endMatches = Array.from(textBeforeCursor.matchAll(/\\end\{([^}]+)\}/g));

  const stack: string[] = [];

  beginMatches.forEach((match) => {
    stack.push(match[1]);
  });

  endMatches.forEach((match) => {
    const idx = stack.lastIndexOf(match[1]);
    if (idx !== -1) {
      stack.splice(idx, 1);
    }
  });

  return stack.length > 0 ? stack[stack.length - 1] : '';
}

function isAlphaNumeric(character: string): boolean {
  return /^[a-zA-Z0-9\/\.]$/.test(character);
}

function isAlphaNumericKommaOrSpace(character: string): boolean {
  return /^[a-zA-Z0-9,\/\.\s]$/.test(character);
}

function shouldCompleteFilename(commandName: string): boolean {
  return ['includegraphics', 'input', 'include'].includes(commandName);
}

function locateMatchingCommandNames(
  extractedWord: string,
  range: monaco.IRange
): monaco.languages.CompletionItem[] {
  const listOfCommands = "addcontentsline addtocontents addtocounter address addtolength addvspace alph appendix arabic author backslash baselineskip baselinestretch begin bf bibitem bigskipamount bigskip boldmath cal caption cdots centering chapter circle cite cleardoublepage clearpage cline closing color copyright dashbox date ddots documentclass dotfill em emph ensuremath euro fbox flushbottom fnsymbol footnote footnotemark footnotesize footnotetext frac frame framebox frenchspacing hfill hline hrulefill hspace huge Huge hyphenation include includegraphics includeonly indent input it item kill label large Large LARGE LaTeX LaTeXe ldots left lefteqn line linebreak linethickness linewidth listoffigures listoftables location makebox maketitle markboth markright mathcal mathop mbox medskip multicolumn multiput newcommand newcounter newenvironment newfont newlength newline newpage newsavebox newtheorem nocite noindent nolinebreak nonfrenchspacing normalsize nopagebreak not int includegraphics item label onecolumn opening oval overbrace overline pagebreak pagenumbering pageref pagestyle par paragraph parbox parindent parskip part protect providecommand put raggedbottom raggedleft raggedright raisebox ref renewcommand right rm roman rule savebox sbox sc scriptsize section setcounter setlength settowidth sf shortstack signature sl slash small smallskip sout space sqrt stackrel subparagraph subsection subsubsection sum ref tableofcontents telephone TeX textbf textcolor textit textmd textnormal textrm textsc textsf textsl texttt textup textwidth textheight thanks thispagestyle tiny title today tt twocolumn typeout typein uline underbrace underline unitlength usebox usecounter uwave value vbox vdots vector verb vfill vline vphantom vspace"; // prettier-ignore
  const commandList = listOfCommands.split(' ');
  const filteredCommands = commandList.filter((cmd) => cmd.startsWith(extractedWord));

  const suggestions = filteredCommands.map((cmd) => {
    const snippet = getSnippetForCommandName(cmd);
    return {
        label: `\\${cmd}`,
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: snippet.insertText,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range: range,
    }});

    return suggestions;
}

function getSnippetForCommandName(command: string): { insertText: string } {
    const snippets: { [key: string]: { insertText: string } } = {
        // Specific commands with special snippets
        'begin': { insertText: 'begin{${1:environment}}\n\t$0\n\\end{${1}}' },
        'frac': { insertText: '\\frac{${1:numerator}}{${2:denominator}}' },
        'sqrt': { insertText: 'sqrt{${1:expression}}' },
        'section': { insertText: 'section{${1:Section Title}}' },
        'subsection': { insertText: 'subsection{${1:Subsection Title}}'},
        'item': { insertText: 'item ${1}' },
        'sum': { insertText: 'sum_{${1:n=1}}^{${2:\\infty}} ${3:expression}'},
        'int': { insertText: 'int_{${1:a}}^{${2:b}} ${3:expression} d${4:x}'},
        'label': { insertText: 'frac{${1:numerator}}{${2:denominator}}'},
        'includegraphics': { insertText: 'includegraphics[width=${1:\\linewidth}]{${2:file}}' },
        'textbf': { insertText: 'textbf{${1:text}}' },
        'textit': { insertText: 'textit{${1:text}}' },
        'underline': { insertText: 'underline{${1:text}}' },
        'ref': { insertText: 'ref{${1:key}}' },
        'cite': { insertText: 'cite{${1:key}}' }
        // Add
    }

    if (snippets[command]) {
        return snippets[command]
    } else {
        return {
            insertText: `\\${command}{${1}}`
        }
    }
}

function locateMatchingWords(
  commandName: string,
  extractedWord: string,
  model: monaco.editor.ITextModel,
  position: monaco.Position,
  range: monaco.IRange
): monaco.languages.CompletionItem[] {
  const text = model.getValue();

  const wordRegex = new RegExp(`\\b${extractedWord}\\w*\\b`, 'g');
  const matches = text.match(wordRegex) || [];

  const uniqueMatches = Array.from(new Set(matches));

  const suggestions = uniqueMatches.map((word) => ({
    label: word,
    kind: monaco.languages.CompletionItemKind.Text,
    insertText: word,
    range: range,
  }));

  return suggestions;
}

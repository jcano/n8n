import type { DocMetadata, DocMetadataArgument, DocMetadataExample } from 'n8n-workflow';
import { sanitizeHtml } from '@/utils/htmlUtils';
import { i18n } from '@/plugins/i18n';

const renderFunctionHeader = (doc?: DocMetadata) => {
	const header = document.createElement('div');
	if (doc) {
		const functionNameSpan = document.createElement('span');
		functionNameSpan.classList.add('autocomplete-info-name');
		functionNameSpan.textContent = doc.name;
		header.appendChild(functionNameSpan);

		const openBracketsSpan = document.createElement('span');
		openBracketsSpan.textContent = '(';
		header.appendChild(openBracketsSpan);

		const argsSpan = document.createElement('span');
		doc.args?.forEach((arg, index, array) => {
			const argSpan = document.createElement('span');
			argSpan.textContent = arg.name;
			argSpan.classList.add('autocomplete-info-arg');
			argsSpan.appendChild(argSpan);

			if (index !== array.length - 1) {
				const separatorSpan = document.createElement('span');
				separatorSpan.textContent = ', ';
				argsSpan.appendChild(separatorSpan);
			}
		});
		header.appendChild(argsSpan);

		const closeBracketsSpan = document.createElement('span');
		closeBracketsSpan.textContent = ')';
		header.appendChild(closeBracketsSpan);
	}
	return header;
};

const renderPropHeader = (doc?: DocMetadata) => {
	const header = document.createElement('div');
	if (doc) {
		const propNameSpan = document.createElement('span');
		propNameSpan.classList.add('autocomplete-info-name');
		propNameSpan.innerText = doc.name;

		const returnTypeSpan = document.createElement('span');
		returnTypeSpan.innerHTML = ': ' + doc.returnType;

		header.appendChild(propNameSpan);
		header.appendChild(returnTypeSpan);
	}
	return header;
};

const renderDescription = ({
	description,
	docUrl,
	example,
}: {
	description: string;
	docUrl?: string;
	example?: DocMetadataExample;
}): HTMLElement => {
	const descriptionBody = document.createElement('div');
	descriptionBody.classList.add('autocomplete-info-description');
	const descriptionText = document.createElement('p');
	descriptionText.innerHTML = sanitizeHtml(description.replace(/`(.*?)`/g, '<code>$1</code>'));
	descriptionBody.appendChild(descriptionText);

	if (docUrl) {
		const descriptionLink = document.createElement('a');
		descriptionLink.setAttribute('target', '_blank');
		descriptionLink.setAttribute('href', docUrl);
		descriptionLink.innerText =
			i18n.autocompleteUIValues.docLinkLabel ?? i18n.baseText('generic.learnMore');
		descriptionLink.addEventListener('mousedown', (event: MouseEvent) => {
			// This will prevent documentation popup closing before click
			// event gets to links
			event.preventDefault();
		});
		descriptionLink.classList.add('autocomplete-info-doc-link');
		descriptionText.appendChild(descriptionLink);
	}

	if (example) {
		const renderedExample = renderExample(example);
		descriptionBody.appendChild(renderedExample);
	}

	return descriptionBody;
};

const renderArgs = (args: DocMetadataArgument[]): HTMLElement => {
	const argsContainer = document.createElement('div');
	argsContainer.classList.add('autocomplete-info-args-container');

	const argsTitle = document.createElement('div');
	argsTitle.classList.add('autocomplete-info-section-title');
	argsTitle.textContent = i18n.baseText('codeNodeEditor.parameters');
	argsContainer.appendChild(argsTitle);

	const argsList = document.createElement('ul');
	argsList.classList.add('autocomplete-info-args');

	for (const arg of args) {
		const argItem = document.createElement('li');
		const argName = document.createElement('span');
		argName.classList.add('autocomplete-info-arg-name');
		argName.textContent = arg.name;
		if (arg.optional === true) argName.textContent += '?';

		argItem.appendChild(argName);

		if (arg.type) {
			const argType = document.createElement('span');
			argType.classList.add('autocomplete-info-arg-type');
			argType.textContent = `: ${arg.type}`;
			argItem.appendChild(argType);
		}

		if (arg.description) {
			const argDescription = document.createElement('span');
			argDescription.classList.add('autocomplete-info-arg-description');
			argDescription.innerHTML = `- ${sanitizeHtml(
				arg.description.replace(/`(.*?)`/g, '<code>$1</code>'),
			)}`;

			argItem.appendChild(argDescription);
		}

		argsList.appendChild(argItem);
	}

	argsContainer.appendChild(argsList);
	return argsContainer;
};

const renderExample = (example: DocMetadataExample): HTMLElement => {
	const examplePre = document.createElement('pre');
	examplePre.classList.add('autocomplete-info-example');
	const exampleCode = document.createElement('code');
	examplePre.appendChild(exampleCode);

	if (example.description) {
		const exampleDescription = document.createElement('span');
		exampleDescription.classList.add('autocomplete-info-example-comment');
		exampleDescription.textContent = `// ${example.description}\n`;
		exampleCode.appendChild(exampleDescription);
	}

	const exampleExpression = document.createElement('span');
	exampleExpression.classList.add('autocomplete-info-example-expr');
	exampleExpression.textContent = example.example + '\n';
	exampleCode.appendChild(exampleExpression);

	if (example.evaluated) {
		const exampleEvaluated = document.createElement('span');
		exampleEvaluated.classList.add('autocomplete-info-example-comment');
		exampleEvaluated.textContent = `// => ${example.evaluated}\n`;
		exampleCode.appendChild(exampleEvaluated);
	}

	return examplePre;
};

const renderExamples = (examples: DocMetadataExample[]): HTMLElement => {
	const examplesContainer = document.createElement('div');
	examplesContainer.classList.add('autocomplete-info-examples');

	const examplesTitle = document.createElement('div');
	examplesTitle.classList.add('autocomplete-info-section-title');
	examplesTitle.textContent = i18n.baseText('codeNodeEditor.examples');
	examplesContainer.appendChild(examplesTitle);

	for (const example of examples) {
		const renderedExample = renderExample(example);
		examplesContainer.appendChild(renderedExample);
	}

	return examplesContainer;
};

export const createInfoBoxRenderer =
	(doc?: DocMetadata, isFunction = false) =>
	(): HTMLElement | null => {
		const tooltipContainer = document.createElement('div');
		tooltipContainer.classList.add('autocomplete-info-container');

		if (!doc) return null;

		const { examples, args } = doc;
		const hasArgs = args && args.length > 0;
		const hasExamples = examples && examples.length > 0;

		const header = isFunction ? renderFunctionHeader(doc) : renderPropHeader(doc);
		header.classList.add('autocomplete-info-header');
		tooltipContainer.appendChild(header);

		if (doc.description) {
			const descriptionBody = renderDescription({
				description: doc.description,
				docUrl: doc.docURL,
				example: hasArgs && hasExamples ? examples[0] : undefined,
			});
			tooltipContainer.appendChild(descriptionBody);
		}

		if (hasArgs) {
			const argsContainer = renderArgs(args);
			tooltipContainer.appendChild(argsContainer);
		}

		if (hasExamples && (examples.length > 1 || !hasArgs)) {
			const examplesContainer = renderExamples(examples);
			tooltipContainer.appendChild(examplesContainer);
		}

		return tooltipContainer;
	};
<?php

namespace App\Services\Mapping;

use App\Services\Mapping\Exceptions\TransformationException;
use App\Services\Mapping\Transformers\CepTransformer;
use App\Services\Mapping\Transformers\CurrencyTransformer;
use App\Services\Mapping\Transformers\DateFormatTransformer;
use App\Services\Mapping\Transformers\LengthTransformer;
use App\Services\Mapping\Transformers\LookupMappingTransformer;
use App\Services\Mapping\Transformers\LowercaseTransformer;
use App\Services\Mapping\Transformers\OnlyDigitsTransformer;
use App\Services\Mapping\Transformers\PhoneTransformer;
use App\Services\Mapping\Transformers\RangeTransformer;
use App\Services\Mapping\Transformers\RegexTransformer;
use App\Services\Mapping\Transformers\RemoveSpecialCharsTransformer;
use App\Services\Mapping\Transformers\ReplaceTextTransformer;
use App\Services\Mapping\Transformers\RequiredTransformer;
use App\Services\Mapping\Transformers\SanitizeDocumentTransformer;
use App\Services\Mapping\Transformers\TitleCaseTransformer;
use App\Services\Mapping\Transformers\TransformerInterface;
use App\Services\Mapping\Transformers\TrimTransformer;
use App\Services\Mapping\Transformers\UnaccentTransformer;
use App\Services\Mapping\Transformers\UppercaseTransformer;

class RowMappingResult
{
    public function __construct(
        public readonly bool $isValid,
        public readonly array $transformedData,
        public readonly array $errors = [],
        public readonly array $rawData = []
    ) {}
}

class MappingEngine
{
    /** @var array<string, TransformerInterface> */
    private array $transformers = [];

    public function __construct()
    {
        $this->registerDefaultTransformers();
    }

    public function registerTransformer(string $name, TransformerInterface $transformer): void
    {
        $this->transformers[$name] = $transformer;
    }

    private function registerDefaultTransformers(): void
    {
        $this->registerTransformer('trim', new TrimTransformer());
        $this->registerTransformer('document', new SanitizeDocumentTransformer());
        $this->registerTransformer('date', new DateFormatTransformer());
        $this->registerTransformer('currency', new CurrencyTransformer());
        $this->registerTransformer('lookup', new LookupMappingTransformer());
        $this->registerTransformer('uppercase', new UppercaseTransformer());
        $this->registerTransformer('lowercase', new LowercaseTransformer());
        $this->registerTransformer('digits', new OnlyDigitsTransformer());
        $this->registerTransformer('required', new RequiredTransformer());
        $this->registerTransformer('regex', new RegexTransformer());
        $this->registerTransformer('length', new LengthTransformer());
        $this->registerTransformer('range', new RangeTransformer());
        $this->registerTransformer('unaccent', new UnaccentTransformer());
        $this->registerTransformer('titlecase', new TitleCaseTransformer());
        $this->registerTransformer('replace', new ReplaceTextTransformer());
        $this->registerTransformer('alphanumeric', new RemoveSpecialCharsTransformer());
        $this->registerTransformer('cep', new CepTransformer());
        $this->registerTransformer('phone', new PhoneTransformer());
    }

    /**
     * Transforma uma linha de dados brutos utilizando a especificação da receita.
     *
     * @param array<string, mixed> $rawRow
     * @param array<string, mixed> $recipe
     * @return RowMappingResult
     */
    public function transformRow(array $rawRow, array $recipe): RowMappingResult
    {
        $transformed = [];
        $errors = [];
        $mappings = $recipe['mappings'] ?? [];

        foreach ($mappings as $targetField => $rule) {
            $sourceField = $rule['source'] ?? null;
            $value = $sourceField !== null && array_key_exists($sourceField, $rawRow)
                ? $rawRow[$sourceField]
                : ($rule['default'] ?? null);

            $pipeline = $rule['transformers'] ?? [];

            try {
                foreach ($pipeline as $step) {
                    $transformerName = is_array($step) ? ($step['type'] ?? '') : (string)$step;
                    $options = is_array($step) ? ($step['options'] ?? []) : [];

                    if (!isset($this->transformers[$transformerName])) {
                        throw new TransformationException("Transformador desconhecido: '{$transformerName}'.", $targetField);
                    }

                    $value = $this->transformers[$transformerName]->transform($value, $options);
                }

                $transformed[$targetField] = $value;
            } catch (TransformationException $e) {
                $errors[] = [
                    'field' => $targetField,
                    'source_field' => $sourceField,
                    'message' => $e->getMessage(),
                    'invalid_value' => $e->invalidValue,
                ];
            }
        }

        $isValid = empty($errors);

        return new RowMappingResult(
            isValid: $isValid,
            transformedData: $transformed,
            errors: $errors,
            rawData: $rawRow
        );
    }
}

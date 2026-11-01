<?php

namespace App\Services\Mapping\Transformers;

use App\Services\Mapping\Exceptions\TransformationException;
use DateTimeImmutable;

class DateFormatTransformer implements TransformerInterface
{
    public function transform(mixed $value, array $options = []): ?string
    {
        $targetFormat = $options['target_format'] ?? 'Y-m-d';

        if ($value instanceof \DateTimeInterface) {
            return $value->format($targetFormat);
        }

        if ($value === null || $value === '') {
            if (!empty($options['nullable'])) {
                return null;
            }
            throw new TransformationException('Data vazia não é permitida.', 'data', $value);
        }

        $inputStr = trim((string)$value);
        $sourceFormats = $options['source_formats'] ?? ['d/m/Y', 'Y-m-d', 'd-m-Y', 'Ymd', 'd/m/Y H:i:s', 'Y-m-d\TH:i:s'];
        $targetFormat = $options['target_format'] ?? 'Y-m-d';

        foreach ($sourceFormats as $format) {
            $parsed = DateTimeImmutable::createFromFormat("!$format", $inputStr);
            if ($parsed && $parsed->format($format) === $inputStr) {
                return $parsed->format($targetFormat);
            }
        }

        throw new TransformationException("Formato de data inválido ou data inexistente: '{$value}'.", 'data', $value);
    }
}

<?php

namespace App\Services\Mapping\Transformers;

use App\Services\Mapping\Exceptions\TransformationException;

class RangeTransformer implements TransformerInterface
{
    public function transform(mixed $value, array $options = []): mixed
    {
        if ($value === null || $value === '') {
            if (!empty($options['nullable'])) {
                return $value;
            }
        }

        if (!is_numeric($value)) {
            throw new TransformationException("Valor não numérico para validação de faixa: '{$value}'.", 'range', $value);
        }

        $num = (float) $value;

        if (isset($options['min']) && $num < (float)$options['min']) {
            throw new TransformationException(
                $options['message'] ?? "Valor {$num} abaixo do limite mínimo permitido ({$options['min']}).",
                'range',
                $value
            );
        }

        if (isset($options['max']) && $num > (float)$options['max']) {
            throw new TransformationException(
                $options['message'] ?? "Valor {$num} acima do limite máximo permitido ({$options['max']}).",
                'range',
                $value
            );
        }

        return $num;
    }
}

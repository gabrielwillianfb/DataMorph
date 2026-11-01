<?php

namespace App\Services\Mapping\Transformers;

use App\Services\Mapping\Exceptions\TransformationException;

class LengthTransformer implements TransformerInterface
{
    public function transform(mixed $value, array $options = []): mixed
    {
        if ($value === null || $value === '') {
            if (!empty($options['nullable'])) {
                return $value;
            }
        }

        $str = (string) $value;
        $len = mb_strlen($str, 'UTF-8');

        if (isset($options['exact']) && $len !== (int)$options['exact']) {
            throw new TransformationException(
                $options['message'] ?? "Tamanho inválido: '{$value}' tem {$len} caracteres (esperado exatamente {$options['exact']}).",
                'length',
                $value
            );
        }

        if (isset($options['min']) && $len < (int)$options['min']) {
            throw new TransformationException(
                $options['message'] ?? "Tamanho insuficiente: mínimo de {$options['min']} caracteres exigido.",
                'length',
                $value
            );
        }

        if (isset($options['max']) && $len > (int)$options['max']) {
            throw new TransformationException(
                $options['message'] ?? "Tamanho excedido: máximo de {$options['max']} caracteres permitido.",
                'length',
                $value
            );
        }

        return $value;
    }
}

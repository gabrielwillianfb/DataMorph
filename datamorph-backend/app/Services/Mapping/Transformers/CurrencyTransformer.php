<?php

namespace App\Services\Mapping\Transformers;

use App\Services\Mapping\Exceptions\TransformationException;

class CurrencyTransformer implements TransformerInterface
{
    public function transform(mixed $value, array $options = []): float
    {
        if ($value === null || $value === '') {
            if (!empty($options['nullable'])) {
                return 0.0;
            }
            throw new TransformationException('Valor monetário não pode ser vazio.', 'valor', $value);
        }

        if (is_numeric($value)) {
            $num = (float)$value;
        } else {
            $str = trim((string)$value);
            // Remove R$, espaços, símbolos de moeda
            $str = preg_replace('/[R$\s]/u', '', $str) ?? '';

            // Se tiver vírgula como decimal (ex: 1.250,50)
            if (str_contains($str, ',') && str_contains($str, '.')) {
                $str = str_replace('.', '', $str);
                $str = str_replace(',', '.', $str);
            } elseif (str_contains($str, ',')) {
                $str = str_replace(',', '.', $str);
            }

            if (!is_numeric($str)) {
                throw new TransformationException("Valor numérico inválido: '{$value}'.", 'valor', $value);
            }
            $num = (float)$str;
        }

        if (empty($options['allow_negative']) && $num < 0) {
            throw new TransformationException("Valores negativos não são permitidos: {$num}.", 'valor', $value);
        }

        return round($num, $options['decimals'] ?? 2);
    }
}

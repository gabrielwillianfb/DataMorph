<?php

namespace App\Services\Mapping\Transformers;

use App\Services\Mapping\Exceptions\TransformationException;

class RegexTransformer implements TransformerInterface
{
    public function transform(mixed $value, array $options = []): mixed
    {
        if ($value === null || $value === '') {
            if (!empty($options['nullable'])) {
                return $value;
            }
        }

        $pattern = $options['pattern'] ?? null;
        if (!$pattern) {
            return $value;
        }

        // Adiciona delimitadores se não houver
        if (!str_starts_with($pattern, '/') || !str_ends_with($pattern, '/')) {
            $pattern = '/' . str_replace('/', '\/', $pattern) . '/u';
        }

        $str = (string) $value;
        if (!preg_match($pattern, $str)) {
            $msg = $options['message'] ?? "O valor '{$value}' não atende ao formato da regra personalizada ({$options['pattern']}).";
            throw new TransformationException($msg, $options['field'] ?? 'regex', $value);
        }

        return $value;
    }
}

<?php

namespace App\Services\Mapping\Transformers;

use App\Services\Mapping\Exceptions\TransformationException;

class LookupMappingTransformer implements TransformerInterface
{
    public function transform(mixed $value, array $options = []): mixed
    {
        $dictionary = $options['dictionary'] ?? [];
        $key = is_string($value) ? trim($value) : (string)$value;

        if (array_key_exists($key, $dictionary)) {
            return $dictionary[$key];
        }

        // Case-insensitive check
        if (!empty($options['case_insensitive'])) {
            $lowerKey = mb_strtolower($key);
            foreach ($dictionary as $dictKey => $dictVal) {
                if (mb_strtolower((string)$dictKey) === $lowerKey) {
                    return $dictVal;
                }
            }
        }

        if (array_key_exists('default', $options)) {
            return $options['default'];
        }

        throw new TransformationException("Código de ocorrência/lookup não mapeado: '{$value}'.", 'lookup', $value);
    }
}

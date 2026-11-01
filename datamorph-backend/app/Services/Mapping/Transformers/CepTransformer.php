<?php

namespace App\Services\Mapping\Transformers;

class CepTransformer implements TransformerInterface
{
    public function transform(mixed $value, array $options = []): mixed
    {
        if ($value === null || $value === '') {
            return $value;
        }

        $digits = preg_replace('/\D/', '', (string)$value);
        if (strlen($digits) === 8) {
            return substr($digits, 0, 5) . '-' . substr($digits, 5);
        }

        return $value;
    }
}

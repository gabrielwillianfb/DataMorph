<?php

namespace App\Services\Mapping\Transformers;

class OnlyDigitsTransformer implements TransformerInterface
{
    public function transform(mixed $value, array $options = []): string
    {
        if ($value === null || $value === '') {
            return '';
        }
        return preg_replace('/\D/', '', (string)$value) ?? '';
    }
}

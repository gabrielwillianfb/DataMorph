<?php

namespace App\Services\Mapping\Transformers;

class TitleCaseTransformer implements TransformerInterface
{
    public function transform(mixed $value, array $options = []): mixed
    {
        if (!is_string($value)) {
            return $value;
        }

        return mb_convert_case(mb_strtolower($value, 'UTF-8'), MB_CASE_TITLE, 'UTF-8');
    }
}

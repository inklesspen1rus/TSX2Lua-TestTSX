local print = print
_G.print = function(...)
    local str = ' '
    for _, v in ipairs(table.pack(...)) do
        str = str .. tostring(v) .. ' '
    end
    print(debug.traceback(str, 2))
end

return {a=2}